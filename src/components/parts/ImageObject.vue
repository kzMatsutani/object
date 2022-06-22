<template>
    <image :width="width" :height="height" :x="object[0].cx" :y="object[0].cy" :transform="rotate"
        :href="image_path" @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift" />
</template>

<script>
export default {
    name: "ImageObject",
    data() {
        return {
        }
    },
    props: ['object', 'center_coordinate', 'width', 'height', 'angle', 'zoom_ratio', 'image_path'],
    computed: {
        rotate: function() {
            return "rotate(" + this.angle + "," + this.object[0].cx + "," + this.object[0].cy + ")"
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