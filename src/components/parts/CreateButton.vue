<template>
<div @click="click"><button>インスタンス作成</button>  </div>
</template>

<script>
export default {
    methods: {
        click() {
            this.$emit('click');
            console.log("インスタンス生成");
        }
    }
}
</script>