<template>
    <svg class="svg_field" width="700" height="500" viewBox="0 0 700 500" fill="#ffff00" @mouseup="flag_reset"
        @mouseleave="flag_reset" @mousemove="move_box($event); rotate_box($event); resize_box($event);"
        @mousedown="flag_reset_select()">
        <OperationObject v-for="(object, idx) in objects" ref="svg_object" :coordinate="object" :idx="idx" :key="idx"
            @select_target="select_target" @shift_select_target="shift_select_target" @alignment="alignment_object_push"
            @move_objects="move_objects"></OperationObject>
    </svg>

</template>
<script>
import OperationObject from './OperationObject.vue';
export default {
    name: "SvgMainArea",
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
        }
    },
    props: [],
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
    },
    beforeMount: function () {

    },
}
</script>

<style>
.svg_field {
    box-shadow: 2px 2px 5px 5px grey;
}
</style>