<template>
    <foreignObject :x="object[0].cx" :y="object[0].cy" :width="width" :height="height" @mousedown.exact="mouse_down"
        @mousedown.shift.exact="mouse_down_shift" :transform="rotate">
        <div class="textarea_object" contentEditable="true"  @mousedown="text_click" :style="style_props">
                テキスト
        </div>
    </foreignObject>
</template>

<script>
export default {
    name: "TextObject",
    data() {
        return {
            default_font_size: 10
        }
    },
    props: ['object' ,'center_coordinate', 'width', 'height', 'angle', 'zoom_ratio'],
    computed: {
        rotate: function() {
            return "rotate(" + this.angle + "," + this.object[0].cx + "," + this.object[0].cy + ")"
        },
        style_props: function() {
            var font_size = this.default_font_size * this.zoom_ratio
            return "font-size:" + font_size + "px;";
        }
    },
    methods: {
        mouse_down() {
            this.$emit("mouse_down");
        },
        mouse_down_shift() {
            this.$emit("mouse_down_shift");
        },
        text_click() {
            this.$emit("text_click")
        }
    }
}
</script>

<style>
.textbox_textarea {
    width: 100%;
    height: 100%;
}

.textarea_object {
    outline: none;
}
</style>