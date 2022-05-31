<template>
    <polygon :points="polygon_points" stroke="black"
        fill="#00ffff" fill-opacity="0" @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift"></polygon>
</template>

<script>
export default {
    name: "TriangleObject",
    data() {
        return {
        }
    },
    props: ['object'],
    computed: {
        polygon_points: function () {
            return this.object[4].cx + "," + this.object[4].cy + " "
                + this.object[3].cx + "," + this.object[3].cy + " " + this.object[2].cx + "," + this.object[2].cy + " ";
        },
    },
    methods: {
        mouse_down() {
            this.$emit("mouse_down");
        },
         mouse_down_shift() {
            this.$emit("mouse_down_shift");
        },
    }
}
</script>

<style>
</style>