<template>
  <div id="app">
    <!-- <CreateButton @click="appendCirclePoint()"></CreateButton> -->
    <div>
      <button class="btn btn-primary m-2" @click="create_object('ellipse')">丸</button>
      <button class="btn btn-primary m-2" @click="create_object('rectangle')">四角</button>
      <button class="btn btn-primary m-2" @click="create_object('triangle')">三角</button>
    </div>
    <div class="mb-2">
      <button class="btn btn-primary m-1" @click="execute_alignment_object('top')">上揃え</button>
      <button class="btn btn-primary m-1" @click="execute_alignment_object('under')">下揃え</button>
      <button class="btn btn-primary m-1" @click="execute_alignment_object('center_vertical')">縦中央揃え</button>
      <button class="btn btn-primary m-1" @click="execute_alignment_object('left')">左揃え</button>
      <button class="btn btn-primary m-1" @click="execute_alignment_object('right')">右揃え</button>
      <button class="btn btn-primary m-1" @click="execute_alignment_object('center_horizontal')">水平中央揃え</button>

    </div>
    <SvgField ref="svg_field"></SvgField>

  </div>
</template>

<script>
// import CreateButton from './components/parts/CreateButton.vue';
import SvgField from './components/parts/SvgField.vue';

export default {
  components: {
    // CreateButton,
    SvgField
  },
  methods: {
    create_object(object) {
      this.$refs.svg_field.create_object(object);
    },
    execute_alignment_object(mode) {
      this.$refs.svg_field.execute_alignment_object(mode);
    },

    click() {
    }
  }
}

</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
