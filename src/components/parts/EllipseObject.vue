<template>

    <ellipse :cx="center_coordinate.x" :cy="center_coordinate.y" :rx="width / 2" :ry="height / 2" stroke="black"
        fill="#00ffff" fill-opacity="0" @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift" :transform="rotate"></ellipse>
</template>

<script>
export default {
    name: "EllipseObject",
    data() {
        return {
        }
    },
    props: ['object', 'center_coordinate', 'width', 'height', 'angle'],
    computed: {
        polygon_points: function () {
            return this.object[0].cx + "," + this.object[0].cy + " " + this.object[1].cx + "," + this.object[1].cy + " "
                + this.object[3].cx + "," + this.object[3].cy + " " + this.object[2].cx + "," + this.object[2].cy + " ";
        },
        rotate: function() {
            return "rotate(" + this.angle + "," + this.center_coordinate.x + "," + this.center_coordinate.y + ")"
        },
    },
    methods: {
        mouse_down() {
            this.$emit("mouse_down");
        },
        mouse_down_shift() {
            this.$emit("mouse_down_shift");
        }
    }
}
</script>

<style>
</style>