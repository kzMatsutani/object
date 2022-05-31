<template>
    <svg class="svg-g">
        <svg v-if="is_ellipse">
            <EllipseObject @mouse_down="flag_up_move(); flag_select();" @mouse_down_shift="shift_select" :center_coordinate="center_coordinate"
                :width="box_width_top" :height="box_height_left" :angle="angle"></EllipseObject>
        </svg>
        <svg v-if="is_rectangle">
            <RectangleObject :object="circle_point" @mouse_down="flag_up_move(); flag_select();" @mouse_down_shift="shift_select"></RectangleObject>
        </svg>
        <svg v-if="is_triangle">
            <TriangleObject :object="circle_point" @mouse_down="flag_up_move(); flag_select();" @mouse_down_shift="shift_select"></TriangleObject>
        </svg>
        <svg v-if="is_text">
        </svg>
        <svg v-if="is_image">
        </svg>


        <svg v-if="flag_is_select">
            <PolygonBox :object="circle_point" @mouse_down="flag_up_move(); flag_select();" @mouse_down_shift="shift_select"></PolygonBox>
            <CirclePoint v-for="(item, idx) in circle_point" v-model="circle_point[idx]" :idx="idx" v-bind:key="item.id"
                @mouse_down="flag_up_resize(idx); flag_select();" @mouse_down_shift="shift_select">
            </CirclePoint>
            <RotateObject :center_x="center_coordinate.x" :center_y="center_coordinate.y" :angle="angle"
                :tl_cx="box_top_left_coordinate.x" :tl_cy="box_top_left_coordinate.y" :top_circle="circle_point[4]"
                @mouse_down="flag_up_rotate(); flag_select();" @mouse_down_shift="shift_select"></RotateObject>
        </svg>
    </svg>
</template>

<script>
import CirclePoint from './CirclePoint.vue';
import RotateObject from './RotateObject.vue';
import PolygonBox from './PolygonBox.vue';
import EllipseObject from './EllipseObject.vue';
import TriangleObject from './TriangleObject';
import RectangleObject from './RectangleObject.vue';
export default {
    props: [
        'coordinate', 'idx'
    ],
    data() {
        return {
            flag_is_move: false, //移動フラグ
            flag_is_rotate: false, //回転フラグ
            flag_is_resize: false, //拡縮フラグ
            before_mouseX: 0, //過去ポインタ座標
            before_mouseY: 0, //過去ポインタ座標
            target_circle: null, //選択しているサークルポイント
            flag_is_select: false,
            is_ellipse: false,
            is_triangle: false,
            is_image: false,
            is_text: false,
            is_rectangle: false,
            angle: 0,
            ratio: { x: 1, y: 1 },
            center_coordinate: { x: 0, y: 0 },
            box_top_left_coordinate: { x: 0, y: 0 },
            alignment_target_coordinate: null,
            circle_point: [
                { id: "circle_point_1", className: "point_top_left", cx: 0, cy: 0 },
                { id: "circle_point_2", className: "point_top_right", cx: 0, cy: 0 },
                { id: "circle_point_3", className: "point_under_left", cx: 0, cy: 0 },
                { id: "circle_point_4", className: "point_under_right", cx: 0, cy: 0 },
                { id: "circle_point_5", className: "point_top", cx: 0, cy: 0 },
                { id: "circle_point_6", className: "point_left", cx: 0, cy: 0 },
                { id: "circle_point_7", className: "point_right", cx: 0, cy: 0 },
                { id: "circle_point_8", className: "point_under", cx: 0, cy: 0 },
            ]
        }
    },
    components: {
        CirclePoint,
        RotateObject,
        PolygonBox,
        EllipseObject,
        TriangleObject,
        RectangleObject
    },
    beforeMount: function () {
        //座標の初期値をセット
        if (this.coordinate.object == "ellipse") this.is_ellipse = true;
        if (this.coordinate.object == "rectangle") this.is_rectangle = true;
        if (this.coordinate.object == "triangle") this.is_triangle = true;
        this.set_initial_coordinate();
        this.calculate_coordinate_array();
    },
    computed: {
        box_width_top: function () {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            var tr = this.circle_point.find((v) => v.className == "point_top_right");
            var temp_left_cx = tl.cx - this.center_coordinate.x;
            var temp_left_cy = tl.cy - this.center_coordinate.y;
            var temp_right_cx = tr.cx - this.center_coordinate.x;
            var temp_right_cy = tr.cy - this.center_coordinate.y;
            var a = (-this.angle) * Math.PI / 180;
            var left_cx = Math.cos(a) * temp_left_cx - Math.sin(a) * temp_left_cy;
            var right_cx = Math.cos(a) * temp_right_cx - Math.sin(a) * temp_right_cy;
            var width = right_cx - left_cx;
            if (width < 0) width *= -1;
            return width;
        },
        box_height_left: function () {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            var ul = this.circle_point.find((v) => v.className == "point_under_left");
            var temp_top_cx = tl.cx - this.center_coordinate.x;
            var temp_top_cy = tl.cy - this.center_coordinate.y;
            var temp_under_cx = ul.cx - this.center_coordinate.x;
            var temp_under_cy = ul.cy - this.center_coordinate.y;
            var a = (-this.angle) * Math.PI / 180;
            var top_cy = Math.sin(a) * temp_top_cx + Math.cos(a) * temp_top_cy;
            var under_cy = Math.sin(a) * temp_under_cx + Math.cos(a) * temp_under_cy;
            var height = under_cy - top_cy;
            if (height < 0) height *= -1;
            return height;
        },
        //サークルTLのx座標
        box_x: function () {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            return tl.cx;
        },
        //サークルTLのy座標
        box_y: function () {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            return tl.cy;
        },
    },
    methods: {
        //オブジェクト作成時の初期値セット
        set_initial_coordinate() {
            var temp_tl_x = this.coordinate.tl.x;
            var temp_tl_y = this.coordinate.tl.y;
            var temp_ur_x = this.coordinate.ur.x;
            var temp_ur_y = this.coordinate.ur.y;
            var temp_mid_x = (temp_ur_x - temp_tl_x) / 2 + temp_tl_x;
            var temp_mid_y = (temp_ur_y - temp_tl_y) / 2 + temp_tl_y;

            this.circle_point.forEach((value, idx) => {
                var temp_x;
                var temp_y;
                //X座標のセット
                if (value.className === "point_top_left" || value.className === "point_under_left" || value.className === "point_left") {
                    temp_x = temp_tl_x;
                } else if (value.className === "point_top_right" || value.className === "point_under_right" || value.className === "point_right") {
                    temp_x = temp_ur_x;
                } else {
                    temp_x = temp_mid_x;
                }

                //Y座標のセット
                if (value.className === "point_top_left" || value.className === "point_top_right" || value.className === "point_top") {
                    temp_y = temp_tl_y;
                } else if (value.className === "point_under_left" || value.className === "point_under_right" || value.className === "point_under") {
                    temp_y = temp_ur_y;
                } else {
                    temp_y = temp_mid_y;
                }
                this.$set(this.circle_point[idx], 'cx', temp_x);
                this.$set(this.circle_point[idx], 'cy', temp_y);
            });


        },
        //box座標の基準位置セット
        calculate_box_top_left_coordinate() {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            var temp_cx = tl.cx - this.center_coordinate.x;
            var temp_cy = tl.cy - this.center_coordinate.y;
            var a = (-this.angle) * Math.PI / 180;
            var cx = (Math.cos(a) * temp_cx - Math.sin(a) * temp_cy) + this.center_coordinate.x;
            var cy = (Math.sin(a) * temp_cx + Math.cos(a) * temp_cy) + this.center_coordinate.y;
            this.$set(this.box_top_left_coordinate, 'x', cx);
            this.$set(this.box_top_left_coordinate, 'y', cy);
        },
        //box座標の中心をセット
        calculate_box_center_coordinate() {
            var tl = this.circle_point.find((v) => v.className == "point_top_left");
            var ur = this.circle_point.find((v) => v.className == "point_under_right");
            var center_cx = (tl.cx + ur.cx) / 2;
            var center_cy = (tl.cy + ur.cy) / 2;
            this.$set(this.center_coordinate, 'x', center_cx);
            this.$set(this.center_coordinate, 'y', center_cy);
        },
        //オブジェクトの回転、拡縮、移動
        calculate_coordinate_array(dx = 0, dy = 0, angle = this.angle, ratio_x = this.ratio.x, ratio_y = this.ratio.y) {
            this.circle_point.forEach((value, idx) => {
                //中心座標を一度0基準にする。
                var temp_x = value.cx - this.center_coordinate.x;
                var temp_y = value.cy - this.center_coordinate.y;

                //一度回転を0°にする
                var a = (-this.angle) * Math.PI / 180;
                var x1 = Math.cos(a) * temp_x - Math.sin(a) * temp_y;
                var y1 = Math.sin(a) * temp_x + Math.cos(a) * temp_y;

                //拡縮の計算
                temp_x = x1 * ratio_x;
                temp_y = y1 * ratio_y;

                //回転の計算
                var a2 = angle * Math.PI / 180;
                var x2 = Math.cos(a2) * temp_x - Math.sin(a2) * temp_y;
                var y2 = Math.sin(a2) * temp_x + Math.cos(a2) * temp_y;

                //座標を戻して移動文加算
                x2 += this.center_coordinate.x + dx;
                y2 += this.center_coordinate.y + dy;

                //値をセット
                this.$set(this.circle_point[idx], 'cx', x2);
                this.$set(this.circle_point[idx], 'cy', y2);
            })
            this.angle = angle;
            this.ratio_x = ratio_x;
            this.ratio_y = ratio_y;
            this.calculate_box_center_coordinate();
            this.calculate_box_top_left_coordinate();
        },
        //オブジェクトの回転、拡縮、移動
        calculate_coordinate(object, idx, dx = 0, dy = 0, angle = this.angle, ratio_x = this.ratio.x, ratio_y = this.ratio.y) {

            //中心座標を一度0基準にする。
            var temp_x = object.cx - this.center_coordinate.x;
            var temp_y = object.cy - this.center_coordinate.y;

            //一度回転を0°にする
            var a = (-this.angle) * Math.PI / 180;
            var x1 = Math.cos(a) * temp_x - Math.sin(a) * temp_y;
            var y1 = Math.sin(a) * temp_x + Math.cos(a) * temp_y;

            //拡縮の計算
            temp_x = x1 * ratio_x;
            temp_y = y1 * ratio_y;

            //回転の計算
            var a2 = angle * Math.PI / 180;
            var x2 = Math.cos(a2) * temp_x - Math.sin(a2) * temp_y;
            var y2 = Math.sin(a2) * temp_x + Math.cos(a2) * temp_y;

            //座標を戻して移動文加算
            x2 += this.center_coordinate.x + dx;
            y2 += this.center_coordinate.y + dy;

            //値をセット
            this.$set(this.circle_point[idx], 'cx', x2);
            this.$set(this.circle_point[idx], 'cy', y2);
        },
        //サイズ変更
        calculate_resize(object, idx, dx = 0, dy = 0, ratio_x = this.ratio.x, ratio_y = this.ratio.y) {
            //中心座標を一度0基準にする。
            var temp_x = object.cx - this.center_coordinate.x;
            var temp_y = object.cy - this.center_coordinate.y;

            //拡縮の計算
            temp_x = temp_x * ratio_x;
            temp_y = temp_y * ratio_y;

            //一度回転を0°にする
            var a = (-this.angle) * Math.PI / 180;
            var x1 = Math.cos(a) * temp_x - Math.sin(a) * temp_y;
            var y1 = Math.sin(a) * temp_x + Math.cos(a) * temp_y;

            //0°の時に拡縮した座標を加算する
            var temp_x2 = x1 + dx;
            var temp_y2 = y1 + dy;

            // 元の回転軸に戻す
            var b = this.angle * Math.PI / 180;
            x1 = Math.cos(b) * temp_x2 - Math.sin(b) * temp_y2;
            y1 = Math.sin(b) * temp_x2 + Math.cos(b) * temp_y2;

            // 中心座標を加算して元の位置に戻す
            x1 += this.center_coordinate.x;
            y1 += this.center_coordinate.y;

            //値をセット
            this.$set(this.circle_point[idx], 'cx', x1);
            this.$set(this.circle_point[idx], 'cy', y1);
        },
        //オブジェクト移動フラグオン
        flag_up_move() {
            this.flag_is_move = true;
            this.$emit("select_target", this.idx);
        },
        flag_select() {
            this.flag_is_select = true;
            this.$emit("select_target", this.idx);
        },
        //オブジェクト回転フラグオン
        flag_up_rotate() {
            this.flag_is_rotate = true;
            this.$emit("select_target", this.idx);
        },
        //オブジェクト拡縮フラグオン
        flag_up_resize(idx) {
            this.flag_is_resize = true;
            this.target_circle = idx;
            this.$emit("select_target", this.idx);
        },
        //フラグや過去座標のリセット
        flag_reset() {
            this.flag_is_move = false;
            this.flag_is_rotate = false;
            this.flag_is_resize = false;
            this.target_circle = null;
            //過去座標の初期化
            this.before_mouseX = 0;
            this.before_mouseY = 0;
        },
        flag_reset_select() {
            this.flag_is_select = false;
        },
        shift_select() {
            if (this.flag_is_select) {
                this.flag_is_select = false;
            } else {
                this.flag_is_select = true;
            }
            this.$emit("shift_select_target", this.idx);
        },
        //オブジェクト移動
        move_box(e) {
            //移動フラグが立っていなければ移動しない
            if (this.flag_is_move == false) {
                return;
            }
            //現在のポインタの座標を取得
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;
            //過去ポインタ座標差分の初期化
            var dx = 0;
            var dy = 0;

            //初動以外は現在ポインタ座標と過去のポインタ座標の差分を定義
            if (this.before_mouseX && this.before_mouseY) {
                dx = mouseX - this.before_mouseX;
                dy = mouseY - this.before_mouseY;
            }

            //現在ポインタ座標を過去ポインタ座標として保存
            this.before_mouseX = mouseX;
            this.before_mouseY = mouseY;

            //ポインタ差分を全てのCircle座標の現在位置の中心位置に加算
            this.calculate_coordinate_array(dx, dy);

            //他オブジェクトも選択されているときは他オブジェクトも移動
            this.$emit("move_objects", dx, dy, this.idx);
        },
        //オブジェクト回転
        rotate_box(e) {
            if (!this.flag_is_rotate) return;

            //2点の座標から角度を求める計算
            //x' = x2 - y1
            //y' = y2 - y1
            //radian = Math.atan2() 

            var temp_x = e.offsetX - this.center_coordinate.x;
            var temp_y = e.offsetY - this.center_coordinate.y;

            //本来0度は上から下方向となるが下から上方向を0°とするためラジアンに+Math.PIで180°プラスする。
            //また-temp_xとすることで左右の動きを反転しマウス操作に追従するようにする。
            var r = Math.atan2(-temp_x, temp_y) + Math.PI;

            //radianからdegreeに変換
            var angle = r * 360 / (2 * Math.PI);
            //最新の角度でサークル座標を再設定
            this.calculate_coordinate_array(0, 0, angle);

        },
        resize_box(e) {
            if (!this.flag_is_resize) return;
            //現在のポインタの座標を取得
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;
            //過去ポインタ座標差分の初期化
            var dx = 0;
            var dy = 0;

            //初動以外は現在ポインタ座標と過去のポインタ座標の差分を定義
            if (this.before_mouseX && this.before_mouseY) {
                dx = mouseX - this.before_mouseX;
                dy = mouseY - this.before_mouseY;
            }

            //現在ポインタ座標を過去ポインタ座標として保存
            this.before_mouseX = mouseX;
            this.before_mouseY = mouseY;

            //現在ドラッグしているターゲットの対角線上の要素を取得
            var diagonal_circle_idx = null;
            if (this.circle_point[this.target_circle].className === 'point_top_left') diagonal_circle_idx = 3;
            if (this.circle_point[this.target_circle].className === 'point_top_right') diagonal_circle_idx = 2;
            if (this.circle_point[this.target_circle].className === 'point_under_left') diagonal_circle_idx = 1;
            if (this.circle_point[this.target_circle].className === 'point_under_right') diagonal_circle_idx = 0;
            if (this.circle_point[this.target_circle].className === 'point_top') diagonal_circle_idx = 7;
            if (this.circle_point[this.target_circle].className === 'point_left') diagonal_circle_idx = 6;
            if (this.circle_point[this.target_circle].className === 'point_right') diagonal_circle_idx = 5;
            if (this.circle_point[this.target_circle].className === 'point_under') diagonal_circle_idx = 4;
            var diagonal_circle = this.circle_point[diagonal_circle_idx];

            //移動する座標から対角線上の固定座標をマイナスし0,0座標にする。
            var temp_origin_x = dx + this.circle_point[this.target_circle].cx - diagonal_circle.cx;
            var temp_origin_y = dy + this.circle_point[this.target_circle].cy - diagonal_circle.cy;

            //一度回転を0°にする
            var radius_0 = (-this.angle) * Math.PI / 180;
            var origin_x = Math.cos(radius_0) * temp_origin_x - Math.sin(radius_0) * temp_origin_y;
            var origin_y = Math.sin(radius_0) * temp_origin_x + Math.cos(radius_0) * temp_origin_y;

            // 元の回転軸に戻す時用のradius設定
            var radius = this.angle * Math.PI / 180;

            //クラス名取得により現在選択しているサークル位置を配列にする。
            var target_class_name = this.circle_point[this.target_circle].className.split(/[_]/);
            target_class_name.shift();

            this.circle_point.forEach((value, idx) => {
                var temp_x = 0;
                var temp_y = 0;
                var temp_reserve_x = 0;
                var temp_reserve_y = 0;

                //座標をセットするサークルのクラス名を取得
                var class_name = value.className.split(/[_]/);
                class_name.shift();

                //ドラッグしている要素に上下要素が入っているときの処理
                if (target_class_name.indexOf("top") != -1 || target_class_name.indexOf("under") != -1) {
                    //ドラッグしている要素にトップが存在する場合
                    if (target_class_name.indexOf("top") != -1) {
                        //座標をセットする要素に上下の有無によって適切な値をセット
                        if (class_name.indexOf("top") != -1) {
                            temp_y = origin_y;
                        } else if (class_name.indexOf("under") != -1) {
                            temp_y = 0;
                        } else {
                            temp_y = origin_y / 2;
                        }
                    }
                    //ドラッグしている要素にアンダーが存在する場合
                    if (target_class_name.indexOf("under") != -1) {
                        //座標をセットする要素に上下の有無によって適切な値をセット
                        if (class_name.indexOf("under") != -1) {
                            temp_y = origin_y;
                        } else if (class_name.indexOf("top") != -1) {
                            temp_y = 0;
                        } else {
                            temp_y = origin_y / 2;
                        }
                    }

                    //ドラッグしている要素に方向が1属性しか存在していない場合はここでもう一属性を定義
                    if (target_class_name.length == 1) {
                        temp_reserve_x = this.circle_point[idx].cx - diagonal_circle.cx;
                        temp_reserve_y = this.circle_point[idx].cy - diagonal_circle.cy;
                        temp_x = Math.cos(radius_0) * temp_reserve_x - Math.sin(radius_0) * temp_reserve_y;
                    }
                }

                //ドラッグしている要素に左右要素が入っているときの処理
                if (target_class_name.indexOf("left") != -1 || target_class_name.indexOf("right") != -1) {
                    //ドラッグしている要素にレフトが存在する場合
                    if (target_class_name.indexOf("left") != -1) {
                        //座標をセットする要素に左右の有無によって適切な値をセット
                        if (class_name.indexOf("left") != -1) {
                            temp_x = origin_x;
                        } else if (class_name.indexOf("right") != -1) {
                            temp_x = 0;
                        } else {
                            temp_x = origin_x / 2;
                        }
                    }
                    //ドラッグしている要素にライトが存在する場合
                    if (target_class_name.indexOf("right") != -1) {
                        //座標をセットする要素に左右の有無によって適切な値をセット
                        if (class_name.indexOf("right") != -1) {
                            temp_x = origin_x;
                        } else if (class_name.indexOf("left") != -1) {
                            temp_x = 0;
                        } else {
                            temp_x = origin_x / 2;
                        }
                    }
                    //ドラッグしている要素に方向が1属性しか存在していない場合はここでもう一属性を定義
                    if (target_class_name.length == 1) {
                        temp_reserve_x = this.circle_point[idx].cx - diagonal_circle.cx;
                        temp_reserve_y = this.circle_point[idx].cy - diagonal_circle.cy;
                        temp_y = Math.sin(radius_0) * temp_reserve_x + Math.cos(radius_0) * temp_reserve_y;
                    }
                }

                //0°にしていた角度を現在角度に変換
                var x1 = Math.cos(radius) * temp_x - Math.sin(radius) * temp_y;
                var y1 = Math.sin(radius) * temp_x + Math.cos(radius) * temp_y;
                //0,0座標基準を元の座標に戻す
                x1 += diagonal_circle.cx;
                y1 += diagonal_circle.cy;
                //値をセット
                this.$set(this.circle_point[idx], 'cx', x1);
                this.$set(this.circle_point[idx], 'cy', y1);

            });
            //中心座標の再計算
            this.calculate_box_center_coordinate();
            this.calculate_box_top_left_coordinate();


        },
        //こちらは最初に書いたやつで使用しないが記念パピコ
        resize_box2(e) {
            if (!this.flag_is_resize) return;
            //現在のポインタの座標を取得
            var mouseX = e.offsetX;
            var mouseY = e.offsetY;
            //過去ポインタ座標差分の初期化
            var dx = 0;
            var dy = 0;
            var dx_half = 0;
            var dy_half = 0;

            // //初動以外は現在ポインタ座標と過去のポインタ座標の差分を定義
            // if (this.before_mouseX && this.before_mouseY) {
            //     dx = mouseX - this.before_mouseX;
            //     dy = mouseY - this.before_mouseY;
            //     dx_half = dx / 2;
            //     dy_half = dy / 2;
            // }

            //初動以外は現在ポインタ座標と過去のポインタ座標の差分を定義
            if (this.before_mouseX && this.before_mouseY) {
                dx = mouseX - this.before_mouseX;
                dy = mouseY - this.before_mouseY;
                var a2 = this.angle * Math.PI / 180;
                var temp_x = Math.cos(a2) * dx - Math.sin(a2) * dy;
                var temp_y = Math.sin(a2) * dx + Math.cos(a2) * dy;
                dx = temp_x;
                dy = temp_y;
                dx_half = dx / 2;
                dy_half = dy / 2;
            }


            // var a2 = this.angle * Math.PI / 180;
            // var temp_x = Math.cos(a2) * mouseX - Math.sin(a2) * mouseY;
            // var temp_y = Math.sin(a2) * mouseX + Math.cos(a2) * mouseY;
            // //初動以外は現在ポインタ座標と過去のポインタ座標の差分を定義
            // if (this.before_mouseX && this.before_mouseY) {
            //     dx = temp_x - this.before_mouseX;
            //     dy = temp_y - this.before_mouseY;
            //     dx_half = dx / 2;
            //     dy_half = dy / 2;
            //     console.log(dx, dy);
            // }
            // //現在ポインタ座標を過去ポインタ座標として保存
            // this.before_mouseX = temp_x;
            // this.before_mouseY = temp_y;

            //現在ポインタ座標を過去ポインタ座標として保存
            this.before_mouseX = mouseX;
            this.before_mouseY = mouseY;

            //クラス名取得により現在選択しているサークル位置を配列にする。
            var target_class_name = this.circle_point[this.target_circle].className.split(/[_]/);
            target_class_name.shift();

            this.circle_point.forEach((value, idx) => {
                var temp_dx = 0;
                var temp_dy = 0;
                //座標をセットするサークルのクラス名を取得
                var class_name = value.className.split(/[_]/);
                class_name.shift();

                //選択した要素に上下要素が入っているか確認
                if (target_class_name.indexOf("top") != -1 || target_class_name.indexOf("under") != -1) {
                    //上下要素が入っていた場合の処理
                    //選択した要素にトップが存在する場合
                    if (target_class_name.indexOf("top") != -1) {
                        if (class_name.indexOf("top") != -1) {
                            temp_dy = dy;
                        } else if (class_name.indexOf("under") != -1) {
                            temp_dy = 0;
                        } else {
                            temp_dy = dy_half;
                        }
                    }
                    //選択した要素にアンダーが存在する場合
                    if (target_class_name.indexOf("under") != -1) {
                        if (class_name.indexOf("under") != -1) {
                            temp_dy = dy;
                        } else if (class_name.indexOf("top") != -1) {
                            temp_dy = 0;
                        } else {
                            temp_dy = dy_half;
                        }
                    }
                }

                //選択した要素に左右要素が入っているか確認
                if (target_class_name.indexOf("left") != -1 || target_class_name.indexOf("right") != -1) {
                    //左右要素が入っていた場合の処理
                    //選択した要素にレフトが存在する場合
                    if (target_class_name.indexOf("left") != -1) {
                        if (class_name.indexOf("left") != -1) {
                            temp_dx = dx;
                        } else if (class_name.indexOf("right") != -1) {
                            temp_dx = 0;
                        } else {
                            temp_dx = dx_half;
                        }
                    }
                    //選択した要素にライトが存在する場合
                    if (target_class_name.indexOf("right") != -1) {
                        if (class_name.indexOf("right") != -1) {
                            temp_dx = dx;
                        } else if (class_name.indexOf("left") != -1) {
                            temp_dx = 0;
                        } else {
                            temp_dx = dx_half;
                        }
                    }
                }

                //移動差分を各座標に反映させる
                this.calculate_resize(value, idx, temp_dx, temp_dy);
            });
            //中心座標の再計算
            this.calculate_box_center_coordinate();
            this.calculate_box_top_left_coordinate();
        },
        //座標整頓のための座標渡し
        get_circle_point_coordinate(mode) {
            var idx = null;
            var value = 0;
            var i = 0;
            var temp = null;
            if (mode == "top") {
                value = +Infinity;
                for (i = 0; i < this.circle_point.length; i++) {
                    if (value > this.circle_point[i].cy) {
                        value = this.circle_point[i].cy;
                        idx = i;
                    }
                }
                temp = this.circle_point[idx];
            } else if (mode == "under") {
                value = -Infinity;
                for (i = 0; i < this.circle_point.length; i++) {
                    if (value < this.circle_point[i].cy) {
                        value = this.circle_point[i].cy;
                        idx = i;
                    }
                }
                temp = this.circle_point[idx];
            } else if (mode == "center_vertical") {
                temp = { cx: this.center_coordinate.x, cy: this.center_coordinate.y };
                value = this.center_coordinate.y;
            } else if (mode == "left") {
                value = +Infinity;
                for (i = 0; i < this.circle_point.length; i++) {
                    if (value > this.circle_point[i].cx) {
                        value = this.circle_point[i].cx;
                        idx = i;
                    }
                }
                temp = this.circle_point[idx];
            } else if (mode == "right") {
                value = -Infinity;
                for (i = 0; i < this.circle_point.length; i++) {
                    if (value < this.circle_point[i].cx) {
                        value = this.circle_point[i].cx;
                        idx = i;
                    }
                }
                temp = this.circle_point[idx];

            } else {
                temp = { cx: this.center_coordinate.x, cy: this.center_coordinate.y };
                value = this.center_coordinate.x;
            }
            this.alignment_target_coordinate = value;
            this.$emit("alignment", temp, this.idx);

        },
        //座標整頓
        alignment_coordinate(coordinate, mode) {
            var dx = 0;
            var dy = 0;

            if (mode == 'top') {
                dy = -(this.alignment_target_coordinate - coordinate);
            } else if (mode == 'under') {
                dy = coordinate - this.alignment_target_coordinate;
            } else if (mode == 'center_vertical') {
                if (this.alignment_target_coordinate == coordinate) dy = 0;
                if (this.alignment_target_coordinate > coordinate) dy = coordinate - this.alignment_target_coordinate;
                if (this.alignment_target_coordinate < coordinate) dy = -(this.alignment_target_coordinate - coordinate);
            }

            if (mode == 'left') {
                dx = -(this.alignment_target_coordinate - coordinate);
            } else if (mode == 'right') {
                dx = coordinate - this.alignment_target_coordinate;
            } else if (mode == 'center_horizontal') {
                if (this.alignment_target_coordinate == coordinate) dx = 0;
                if (this.alignment_target_coordinate > coordinate) dx = coordinate - this.alignment_target_coordinate;
                if (this.alignment_target_coordinate < coordinate) dx = -(this.alignment_target_coordinate - coordinate);
            }

            this.calculate_coordinate_array(dx, dy);
        }
    },

}
</script>