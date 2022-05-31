<template>

    <circle :id="value.id" :class="value.class" :cx="value.cx" :cy="value.cy" r="5" stroke="black" fill="#ffff00" fill-opacity="0"
         @mousedown.exact="mouse_down" @mousedown.shift.exact="mouse_down_shift"></circle>
</template>

<script>
export default {
    name: "CirclePoint",
    props: ['value', 'idx'],
    methods: {
        mouse_down() {
            this.$emit('mouse_down', this.idx);
        },
         mouse_down_shift() {
            this.$emit("mouse_down_shift");
        },
    },
    computed: {
    }
}
</script>

<style>

</style>