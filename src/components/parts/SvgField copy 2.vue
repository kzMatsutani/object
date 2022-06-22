<template>
    <!-- <button @click="create_object" value="テスト" ></button> -->
    <div id="svg_field" :style="svg_field" @click="event_test">
        <svg width="100%" height="100%" fill="#ffff00" @mouseup="flag_reset" @mouseleave="flag_reset"
            @mousemove="move_box($event); rotate_box($event); resize_box($event);" @mousedown="flag_reset_select()">
            <rect :x="canvas_coordinate_x" :y="canvas_coordinate_y" :width="canvas_width" :height="canvas_height"
                fill="#ffffff"></rect>
            <OperationObject v-for="object in objects" ref="svg_object" :coordinate="object" :object_id="object.id"
                :key="object.id" :ratio="zoom_ratio" @select_target="select_target" @shift_select_target="shift_select_target"
                @alignment="alignment_object_push" @move_objects="move_objects"></OperationObject>
        </svg>
    </div>

</template>
<script>
import OperationObject from './OperationObject.vue';
import AppCore from '@/settings/AppCore';
const app_core = new AppCore.getInstance();
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
            count_object: 0,
            alignment_object_target: [],
            select_canvas_type: "a4_horizontal",
            canvas_type: { a4_vertical: { width: 210, height: 297 }, a4_horizontal: { width: 297, height: 210 }, hd: { width: 160, height: 90 }, },
            canvas_coordinate: { x: 0, y: 0 },
            svg_field_size: { width: null, height: null },
            before_svg_field_size: { width: null, height: null },
            min_svg_field_size: { width: null, height: null },
            svg_in_flame_size: { width: null, height: null },
            svg_out_flame_size: { width: null, height: null },
            canvas_min_margin: { width: 200, height: 150 },
            canvas_min_coordinate: { x: 100, y: 75 },
            before_scroll: { x: null, y: null },
        }
    },
    props: ["zoom_ratio"],
    mounted: function () {
        window.addEventListener('resize', this.resize_window);
        window.addEventListener('keydown', (e) => {
            console.log(e.code);
            if (e.code == 'Delete') {
                this.delete_object();
            }
            if (e.code == 'KeyA') {
                // console.log(this.select_targets);
                console.log(this.objects);
            }
            if (e.code == 'KeyS') {
                // console.log(this.select_targets);
                console.log(this.select_targets);
            }
        })
        this.set_props(this.zoom_ratio);
    },
    beforeUpdate: function () {
    },
    beforeDestroy: function () {
        window.removeEventListener('resize', this.resize_window);
    },
    watch: {
        zoom_ratio(newValue, oldValue) {
            this.set_props(newValue, oldValue);
            this.fit_scroll(newValue);
            this.zoom_ratio_apply(newValue);
        }
    },
    computed: {
        svg_field() {
            //現在のキャンバスサイズと最低限の余白
            var width = this.min_svg_field_size.width;
            var height = this.min_svg_field_size.height;
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
            return this.zoom_ratio * this.canvas_type[this.select_canvas_type].width;
        },
        //キャンバスのheight
        canvas_height() {
            return this.zoom_ratio * this.canvas_type[this.select_canvas_type].height;
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
    },
    methods: {
        event_test() {
        },
        flag_reset() {
            if (this.objects.length == 0) return;
            // for (var i = 0; i < this.$refs.svg_object.length; i++) {
            //     this.$refs.svg_object[i].flag_reset();
            // }
            app_core.executeEvent('flag_reset');
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
        create_object(object_type, image_path) {
            this.objects.push({
                id: this.count_object, tl: { x: 100, y: 100 }, ur: { x: 200, y: 200 }, object_type: object_type, image_path: image_path
            });
            this.count_object++;
        },
        delete_object() {
            // 現在選択中のオブジェクトのidと作成したオブジェクトのidが同一のものを削除する
            var delete_idx = [];
            this.select_targets.forEach((value) => {
                console.log(this.objects[value.id].object_type);
                this.objects.forEach((val, idx) => {
                    if (val.id === value.id) delete_idx.push(idx);    
                })
                // this.$delete(this.objects, value.id);
                // this.objects.splice(value.id, 0);
            });
            console.log(delete_idx);
            delete_idx.forEach((value) => {
                console.log(value);
                this.objects.splice(value, 1);
            })
            app_core.executeEvent("delete_self");
            this.flag_reset();
            this.flag_reset_select();
            this.select_targets = [];


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
            var temp = {
                width: this.svg_field_size.width > this.svg_in_flame_size.width ? this.svg_field_size.width : this.svg_in_flame_size.width,
                height: this.svg_field_size.height > this.svg_in_flame_size.height ? this.svg_field_size.height : this.svg_in_flame_size.height,
            };
            this.$refs.svg_object.forEach((value, idx) => {
                this.$refs.svg_object[idx].zoom_ratio_apply(ratio, temp, this.before_svg_field_size);
            });
        },
        resize_window() {
            this.set_props(this.zoom_ratio);
            this.zoom_ratio_apply(this.zoom_ratio);
        },
        set_props(ratio, old_ratio) {
            //ZOOM処理の前にスクロール差分を取得
            var svg_out_flame = document.querySelector('#svg_out_flame');
            var svg_in_flame = document.querySelector('#svg_in_flame');
            old_ratio = old_ratio == undefined ? ratio : old_ratio;
            //(現在のスクロール距離 - 中心までのスクロール距離) / 過去ratioで移動差分を計算
            var temp_scroll_x = (svg_out_flame.scrollLeft - ((this.svg_field_size.width / 2) - (svg_out_flame.clientWidth / 2))) / old_ratio;
            var temp_scroll_y = (svg_out_flame.scrollTop - ((this.svg_field_size.height / 2) - (svg_out_flame.clientHeight / 2))) / old_ratio;
            this.$set(this.before_scroll, "x", temp_scroll_x);
            this.$set(this.before_scroll, "y", temp_scroll_y);

            var field_width = ratio * this.canvas_type[this.select_canvas_type].width + this.canvas_min_margin.width;
            var field_height = ratio * this.canvas_type[this.select_canvas_type].height + this.canvas_min_margin.height;

            //最低限必要なスクリーンサイズを設定
            this.$set(this.min_svg_field_size, "width", field_width);
            this.$set(this.min_svg_field_size, "height", field_height);

            //最低限のスクリーンサイズと現在のスクリーンサイズを比較して大きいほうを抽出
            field_width = field_width > svg_in_flame.clientWidth ? field_width : svg_in_flame.clientWidth;
            field_height = field_height > svg_in_flame.clientHeight ? field_height : svg_in_flame.clientHeight;

            //初期値がnullであれば現在のスクリーンサイズを適用
            if (this.before_svg_field_size.width == null) {
                this.$set(this.before_svg_field_size, "width", field_width);
            } else {
                this.$set(this.before_svg_field_size, "width", this.svg_field_size.width);
            }
            if (this.before_svg_field_size.height == null) {
                this.$set(this.before_svg_field_size, "height", field_height);
            } else {
                this.$set(this.before_svg_field_size, "height", this.svg_field_size.height);
            }
            this.$set(this.svg_in_flame_size, "width", svg_in_flame.clientWidth);
            this.$set(this.svg_in_flame_size, "height", svg_in_flame.clientHeight);
            this.$set(this.svg_out_flame_size, "width", svg_out_flame.clientWidth);
            this.$set(this.svg_out_flame_size, "height", svg_out_flame.clientHeight);
            this.$set(this.svg_field_size, "width", field_width);
            this.$set(this.svg_field_size, "height", field_height);

        },
        fit_screen(mode) {
            var svg_in_flame = document.querySelector('#svg_in_flame');
            var temp_ratio = null;
            if (mode == 'horizontal') {
                temp_ratio = svg_in_flame.clientWidth / (this.canvas_type[this.select_canvas_type].width + (this.canvas_min_margin.width / 2));
            } else {
                temp_ratio = svg_in_flame.clientHeight / (this.canvas_type[this.select_canvas_type].height + (this.canvas_min_margin.height / 2));
            }
            this.$emit("ratio_change", temp_ratio);
        },
        fit_scroll(ratio) {
            //スクロール処理
            var svg_out_flame = document.querySelector('#svg_out_flame');
            var temp_x = 0;
            var temp_y = 0;
            temp_x = (this.svg_field_size.width / 2) - (this.svg_out_flame_size.width / 2);
            temp_y = (this.svg_field_size.height / 2) - (this.svg_out_flame_size.height / 2);
            //中心位置にスクロールする値にスクロール移動差分を加算
            temp_x = temp_x + (this.before_scroll.x * ratio);
            temp_y = temp_y + (this.before_scroll.y * ratio);
            svg_out_flame.scrollTo(temp_x, temp_y);
        }
    },
    beforeMount: function () {

    },
}
</script>

<style>
</style>