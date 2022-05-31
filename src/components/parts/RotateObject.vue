<template>
    <svg>
        <line :x1="circle_cx" :y1="circle_xy" :x2="circle_cx" :y2="top_circle.cy" stroke="#000000" :transform="circle_rotate"> </line>
        <circle :cx="circle_cx" :cy="circle_xy" r="10" :transform="circle_rotate" fill="#ffff00" 
             @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift" > </circle>
        <image :width="width" :height="height" :x="image_x" :y="image_y" :transform="circle_rotate"
            xlink:href="../../assets/110.png"  @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift" />
    </svg>
</template>

<script>
export default {
    name: "RotateObject",
    data() {
        return {
            width: 15, //画像の幅
            height: 15, //画像の高さ
            circle_xy_calculate: 25 //回転ポインタの位置
        }
    },
    props: ['angle', 'center_x', 'center_y', 'top_circle'],
    computed: {
        image_x: function () {
            return this.top_circle.cx - (this.width / 2);
        },
        image_y: function () {
            return this.top_circle.cy - 35 + 1 ;
        },
        image_center_x: function () {
            return this.image_x + (this.width / 2);
        },
        image_center_y: function () {
            return this.image_y + (this.height / 2);
        },
        circle_rotate: function () {
            return "rotate(" + this.angle + "," + this.circle_cx + "," + this.top_circle.cy + ")";
        },
        circle_cx: function () {
            return this.top_circle.cx;
        },
        circle_xy: function () {
            return this.top_circle.cy - this.circle_xy_calculate;
        },
    },
    methods: {
        mouse_down() {
            this.$emit("mouse_down");
        },
        mouse_down_shift() {
            this.$emit("mouse_down_shift");
        },
        check() {

        }
    }
}
</script>

<style>
</style>