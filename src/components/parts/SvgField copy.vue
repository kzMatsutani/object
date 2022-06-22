<template>
    <!-- <button @click="create_object" value="テスト" ></button> -->
    <div id="svg_field" :style="svg_field">
        <svg width="100%" height="100%" fill="#ffff00" @mouseup="flag_reset" @mouseleave="flag_reset"
            @mousemove="move_box($event); rotate_box($event); resize_box($event);" @mousedown="flag_reset_select()">
            <rect :x="canvas_coordinate_x" :y="canvas_coordinate_y" :width="canvas_width" :height="canvas_height"
                fill="#ffffff"></rect>
            <OperationObject v-for="(object, idx) in objects" ref="svg_object" :coordinate="object" :idx="idx"
                :key="idx" :ratio="ratio_calc" @select_target="select_target" @shift_select_target="shift_select_target"
                @alignment="alignment_object_push" @move_objects="move_objects"></OperationObject>
        </svg>
    </div>

</template>
<script>
import OperationObject from './OperationObject.vue';
export default {
    name: "SvgField",
    components: {
        OperationObject
    },
    data() {
        return {
            target: null,
            flag_is_select: false,
            select_targets: [],
            objects: [],
            alignment_object_target: [],
            select_canvas_type: "a4_horizontal",
            canvas_type: { a4_vertical: { width: 210, height: 297 }, a4_horizontal: { width: 297, height: 210 } },
            canvas_coordinate: { x: 0, y: 0 },
            svg_field_size: { width: null, height: null },
            svg_in_flame_size: { width: null, height: null },
            canvas_min_margin: { width: 100, height: 60 },
            canvas_min_coordinate: { x: 50, y: 30 },
        }
    },
    props: ["zoom_ratio"],
    mounted: function () {
        window.addEventListener('resize', this.calculate_canvas);
        this.calculate_canvas();
    },
    beforeUpdate: function () {
        this.set_size();
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.calculate_canvas);
    },
    watch: {
        zoom_ratio(newValue) {
            this.set_props(newValue * 0.01);
            // this.zoom_ratio_apply(newValue * 0.01);
            console.log("ratio監視中", newValue);
        }
    },
    computed: {
        svg_field() {
            //現在のキャンバスサイズと最低限の余白
            var width = this.ratio_calc * this.canvas_type[this.select_canvas_type].width + this.canvas_min_margin.width;
            var height = this.ratio_calc * this.canvas_type[this.select_canvas_type].height + this.canvas_min_margin.height;
            //現在の画面サイズ
            var min_width = this.svg_in_flame_size.width;
            var min_height = this.svg_in_flame_size.height;
            //二つの値を比較して画面サイズの方が大きければ、画面サイズそのものをSVGの範囲にする。
            if (width < min_width) {
                width = "100%";
            } else {
                width = width + "px";
            }

            if (height < min_height) {
                height = "100%";
            } else {
                height = height + "px";
            }
            return "width:" + width + "; height:" + height + ";";
        },
        //キャンバスのwidth
        canvas_width() {
            return this.ratio_calc * this.canvas_type[this.select_canvas_type].width;
        },
        //キャンバスのheight
        canvas_height() {
            return this.ratio_calc * this.canvas_type[this.select_canvas_type].height;
        },
        //キャンバスの起点座標
        canvas_coordinate_x() {
            var field_width = this.svg_in_flame_size.width;
            var temp_x = (field_width - this.canvas_width) / 2;
            if (temp_x < this.canvas_min_coordinate.x) temp_x = this.canvas_min_coordinate.x;
            return temp_x;
        },
        //キャンバスの起点座標
        canvas_coordinate_y() {
            var field_height = this.svg_in_flame_size.height;
            var temp_y = (field_height - this.canvas_height) / 2;
            if (temp_y < this.canvas_min_coordinate.y) temp_y = this.canvas_min_coordinate.y;
            return temp_y;
        },
        ratio_calc() {
            return this.zoom_ratio * .01;
        }

    },
    methods: {
        flag_reset() {
            if (this.objects.length == 0) return;
            for (var i = 0; i < this.$refs.svg_object.length; i++) {
                this.$refs.svg_object[i].flag_reset();
            }
            this.target = null;
        },
        //直近に選択したオブジェクト以外の選択フラグを下げる 
        flag_reset_select() {
            if (this.objects.length == 0) return;
            if (this.flag_is_select) {
                this.$refs.svg_object.forEach((value, idx) => {
                    if (idx == this.target) return;
                    if (this.select_targets.some((value) => value.id == idx)) return;
                    this.$refs.svg_object[idx].flag_reset_select();
                });
                this.flag_is_select = false;
            } else {
                this.$refs.svg_object.forEach((value, idx) => {
                    this.$refs.svg_object[idx].flag_reset_select();
                });
                this.target = null;
                this.select_targets = [];
            }
        },
        move_box(e) {
            if (this.target == null) return;
            if (this.objects.length == 0) return;
            this.$refs.svg_object[this.target].move_box(e);
        },
        rotate_box(e) {
            if (this.target == null) return;
            if (this.objects.length == 0) return;
            this.$refs.svg_object[this.target].rotate_box(e);
        },
        resize_box(e) {
            if (this.target == null) return;
            if (this.objects.length == 0) return;
            this.$refs.svg_object[this.target].resize_box(e);
        },
        create_object(object) {
            this.objects.push({
                tl: { x: 100, y: 100 }, ur: { x: 200, y: 200 }, object: object
            });
        },
        //オブジェクトの移動が行われるとき、他オブジェクトも対象だった場合
        move_objects(dx, dy, idx) {
            if (this.select_targets.length == 1) return;
            this.select_targets.forEach((value) => {
                if (value.id == idx) return;
                this.$refs.svg_object[value.id].calculate_coordinate_array(dx, dy);
            });
        },
        //選択オブジェクトの整列実行
        execute_alignment_object(mode) {
            //現在選択しているオブジェクトが存在しなければ終了
            if (this.select_targets.length == 0) return;

            //選択しているオブジェクトからモードに応じた座標を取得
            this.select_targets.forEach((value) => {
                this.$refs.svg_object[value.id].get_circle_point_coordinate(mode);
            });

            var int_coordinate = null;
            //オブジェクトから取得した座標をモードによって座標を選定
            if (mode == "top") {
                int_coordinate = +Infinity;
                this.alignment_object_target.forEach((value) => {
                    if (int_coordinate > value.y) {
                        int_coordinate = value.y;
                    }
                });
            } else if (mode == "under") {
                int_coordinate = -Infinity;
                this.alignment_object_target.forEach((value) => {
                    if (int_coordinate < value.y) {
                        int_coordinate = value.y;
                    }
                });
            } else if (mode == "center_vertical") {
                int_coordinate = 0;
                this.alignment_object_target.forEach((value) => {
                    int_coordinate += value.y;
                });
                int_coordinate = int_coordinate / this.alignment_object_target.length;
            } else if (mode == "left") {
                int_coordinate = +Infinity;
                this.alignment_object_target.forEach((value) => {
                    if (int_coordinate > value.x) {
                        int_coordinate = value.x;
                    }
                });
            } else if (mode == "right") {
                int_coordinate = -Infinity;
                this.alignment_object_target.forEach((value) => {
                    if (int_coordinate < value.x) {
                        int_coordinate = value.x;
                    }
                });
            } else {
                int_coordinate = 0;
                this.alignment_object_target.forEach((value) => {
                    int_coordinate += value.x;
                });
                int_coordinate = int_coordinate / this.alignment_object_target.length;
            }
            //選定した座標を各オブジェクトに反映
            this.alignment_object_target.forEach((value) => {
                this.$refs.svg_object[value.id].alignment_coordinate(int_coordinate, mode);
            });

            //取得した座標を空にする
            this.alignment_object_target = [];

        },
        //選択オブジェクトから整列する座標の取得
        alignment_object_push(coordinate, idx) {
            this.alignment_object_target.push({ id: idx, x: coordinate.cx, y: coordinate.cy });
        },
        //キーを何も押下しないで、オブジェクトをクリック選択された時
        select_target(idx) {
            if (!this.select_targets.some((value) => value.id === idx)) {
                this.select_targets = [];
                this.select_targets.push({ id: idx });
            }

            this.target = idx;
            this.flag_is_select = true;
        },
        //シフトキーを押下したまま、オブジェクトをクリック選択した時
        shift_select_target(idx) {
            //既に選択配列に入っている場合は除外
            if (this.select_targets.some((value) => value.id === idx)) {
                this.select_targets.splice(idx, 1);
            } else {
                //新たに選択された場合は選択配列に入れる
                this.select_targets.push({ id: idx });
            }
            this.flag_is_select = true;
        },
        zoom_ratio_apply(ratio) {
            if (this.objects.length == 0) return;
            var svg_in_flame = document.querySelector('#svg_in_flame');
            var svg_field = document.querySelector('#svg_field');
            // // var temp_width = svg_in_flame.clientWidth > svg_field.clientWidth ? svg_in_flame.clientWidth : svg_field.clientWidth;
            // // var temp_height = svg_in_flame.clientHeight > svg_field.clientHeight ? svg_in_flame.clientHeight : svg_field.clientHeight;
            var temp = { width: svg_field.clientWidth, height: svg_field.clientHeight };
            this.$refs.svg_object.forEach((value, idx) => {
                this.$refs.svg_object[idx].zoom_ratio_apply(ratio, temp, this.svg_field_size);
            });
            // var doc = document.querySelector('#svg_in_flame');
            // // var doc = document.querySelector('#svg_field');
            this.$set(this.svg_field_size, "width", svg_field.clientWidth);
            this.$set(this.svg_field_size, "height", svg_field.clientHeight);
            this.$set(this.svg_in_flame_size, "width", svg_in_flame.clientWidth);
            this.$set(this.svg_in_flame_size, "height", svg_in_flame.clientHeight);
        },
        calculate_canvas() {
            var svg_in_flame = document.querySelector('#svg_in_flame');
            var svg_field = document.querySelector('#svg_field');
            // var temp_width = svg_in_flame.clientWidth > svg_field.clientWidth ? svg_in_flame.clientWidth : svg_field.clientWidth;
            // var temp_height = svg_in_flame.clientHeight > svg_field.clientHeight ? svg_in_flame.clientHeight : svg_field.clientHeight;

            // var temp_width = this.ratio_calc * this.canvas_type[this.select_canvas_type].width + this.canvas_min_margin.width;
            // var temp_height = this.ratio_calc * this.canvas_type[this.select_canvas_type].height + this.canvas_min_margin.height;

            // if (temp_width < svg_in_flame.clientWidth) {
            //     temp_width = svg_in_flame.clientWidth;
            // } 

            // if (temp_height < svg_in_flame.clientHeight) {
            //     temp_height = this.svg_in_flame_size.height;
            // }
            var temp = { width: svg_field.clientWidth, height: svg_field.clientHeight };
            if (this.objects.length > 0) {
                this.$refs.svg_object.forEach((value, idx) => {
                    this.$refs.svg_object[idx].screen_resize(temp, this.svg_field_size);
                });
            }

            this.$set(this.svg_in_flame_size, "width", svg_in_flame.clientWidth);
            this.$set(this.svg_in_flame_size, "height", svg_in_flame.clientHeight);
            this.$set(this.svg_field_size, "width", svg_field.clientWidth);
            this.$set(this.svg_field_size, "height", svg_field.clientHeight);
        },
        set_size() {
            // var svg_in_flame = document.querySelector('#svg_in_flame');
            // var svg_field = document.querySelector('#svg_field');
            // this.$set(this.svg_in_flame_size, "width", svg_in_flame.clientWidth);
            // this.$set(this.svg_in_flame_size, "height", svg_in_flame.clientHeight);
            // this.$set(this.svg_field_size, "width", svg_field.clientWidth);
            // this.$set(this.svg_field_size, "height", svg_field.clientHeight);
        },
        set_props(ratio) {
            var field_width = ratio * this.canvas_type[this.select_canvas_type].width + this.canvas_min_margin.width;
            var field_height = ratio * this.canvas_type[this.select_canvas_type].height + this.canvas_min_margin.height;
            var svg_in_flame = document.querySelector('#svg_in_flame');
            this.$set(this.svg_in_flame_size, "width", svg_in_flame.clientWidth);
            this.$set(this.svg_in_flame_size, "height", svg_in_flame.clientHeight);
            this.$set(this.svg_field_size, "width", field_width);
            this.$set(this.svg_field_size, "height", field_height);

        }
    },
    beforeMount: function () {

    },
}
</script>

<style>
</style>