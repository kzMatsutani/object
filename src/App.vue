<template>
  <div id="app">
    <div class="container-fluid">
      <div class="row">
        <div id="left_menu_area" class="col-1 p-1">
          <div class="btn-group-vertical ">
            <v-btn class="mb-2" outlined elevation="2" @click="create_object('ellipse')" v-tooltip.right="'円の図形'">
              <v-icon>mdi-checkbox-blank-circle-outline</v-icon>
            </v-btn>
            <v-btn class="mb-2" outlined elevation="2" @click="create_object('rectangle')" v-tooltip.right="'四角の図形'">
              <v-icon>mdi-square-outline </v-icon>
            </v-btn>
            <v-btn class="mb-2" outlined elevation="2" @click="create_object('triangle')" v-tooltip.right="'三角の図形'">
              <v-icon>mdi-triangle-outline </v-icon>
            </v-btn>
            <v-btn class="mb-2" outlined elevation="2" @click="create_object('text')" v-tooltip.right="'テキスト'">
              <v-icon>mdi-format-text</v-icon>
            </v-btn>
            <v-btn class="mb-2" outlined elevation="2" @click="click_image_upload_button" v-tooltip.right="'画像'">
              <v-icon>mdi-image-plus </v-icon>
            </v-btn>
          </div>
          <input type="file" id="file_upload_image" style="display:none">
        </div>
        <div id="main_area" class="col-9 p-1">
          <div class="mb-2">
            <v-btn class="ml-2" outlined elevation="2" @click="execute_alignment_object('top')" v-tooltip.top="'上揃え'">
              <v-icon>mdi-align-vertical-top</v-icon>
            </v-btn>
            <v-btn class="ml-2" outlined elevation="2" @click="execute_alignment_object('under')" v-tooltip.top="'下揃え'">
              <v-icon>mdi-align-vertical-bottom</v-icon>
            </v-btn>
            <v-btn class="ml-2" outlined elevation="2" @click="execute_alignment_object('center_vertical')"
              v-tooltip.top="'縦中央揃え'">
              <v-icon>mdi-align-vertical-center </v-icon>
            </v-btn>
            <v-btn class="ml-5" outlined elevation="2" @click="execute_alignment_object('left')" v-tooltip.top="'左揃え'">
              <v-icon>mdi-align-horizontal-left </v-icon>
            </v-btn>
            <v-btn class="ml-2" outlined elevation="2" @click="execute_alignment_object('right')" v-tooltip.top="'右揃え'">
              <v-icon>mdi-align-horizontal-right</v-icon>
            </v-btn>
            <v-btn class="ml-2" outlined elevation="2" @click="execute_alignment_object('center_horizontal')"
              v-tooltip.top="'水平中央揃え'">
              <v-icon>mdi-align-horizontal-center </v-icon>
            </v-btn>
          </div>
          <div id="svg_out_flame" class="p-0  border">
            <div id="svg_in_flame" class="svg_in_flame">
              <SvgField ref="svg_field" :zoom_ratio="zoom_ratio" @ratio_change="ratio_change"></SvgField>
            </div>
          </div>
        </div>
        <div id="right_menu_area" class="col-2 p-1">
          <PropertyObject></PropertyObject>
        </div>
      </div>
    </div>
    <footer class="footer mt-2">
      <div class="container">
        <v-icon>mdi-magnify-minus-outline</v-icon>
        <input type="range" v-model="zoom_ratio" min="1" max="15" step="0.01">
        <v-icon>mdi-magnify-plus-outline</v-icon>
        <v-btn class="ml-2" outlined elevation="2" @click="execute_fit_screen('horizontal')" v-tooltip.top="'横に合わせる'">
          <v-icon>mdi-arrow-expand-horizontal</v-icon>
        </v-btn>
        <v-btn class="ml-2" outlined elevation="2" @click="execute_fit_screen('vertical')" v-tooltip.top="'縦に合わせる'">
          <v-icon>mdi-arrow-expand-vertical</v-icon>
        </v-btn>
      </div>
    </footer>
  </div>

</template>

<script>
import Vue from 'vue';
import VTooltip from 'v-tooltip'
import SvgField from './components/parts/SvgField.vue';
import PropertyObject from './components/parts/PropertyObject.vue';

Vue.use(VTooltip);

export default {
  components: {
    SvgField,
    PropertyObject
  },
  data() {
    return {
      zoom_ratio: 1,
      canvas_type: [{ name: "a4_vertical", width: 210, height: 297 }, { name: "a4_horizontal", width: 297, height: 210 }, { name: "hd", width: 160, height: 90 },],
      object_menu: [{ type: 'ellipse', caption: '円の図形', icon: 'mdi-checkbox-blank-circle-outline' }, 
                    { type: 'rectangle', caption: '四角の図形', icon: 'mdi-square-outline' },
                    { type: 'triangle', caption: '三角の図形', icon: 'mdi-square-outline' },
                    { type: 'text', caption: 'テキスト', icon: 'mdi-square-outline' },
                    ],
    }
  },
  mounted: function () {
    //デフォルト画面設定
    this.execute_fit_screen('horizontal');

    //画像読み込みイベント
    document.querySelector("#file_upload_image").addEventListener("change", (e) => {
      var file_reader = new FileReader();

      // ファイルの読み込みを行ったらイメージオブジェクト作成
      file_reader.addEventListener('load', (e) => {
        this.$refs.svg_field.create_object('image', e.target.result);
      });
      file_reader.readAsDataURL(e.target.files[0])
    });
  },
  computed: {
  },
  watch: {
  },
  methods: {
    create_object(object_type) {
      this.$refs.svg_field.create_object(object_type);
    },
    execute_alignment_object(mode) {
      this.$refs.svg_field.execute_alignment_object(mode);
    },
    execute_fit_screen(mode) {
      this.$refs.svg_field.fit_screen(mode);
    },
    ratio_change(ratio) {
      this.zoom_ratio = ratio;
    },
    click_image_upload_button() {
      var image_ele = document.querySelector("#file_upload_image");
      image_ele.click();
      // this.$refs.svg_field.execute_alignment_object(mode);
    }
  },
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

#left_menu_area {
  width: 150px;
}

#main_area {
  width: calc((100vw - 350px) - 40px);
}

#right_menu_area {
  width: 250px;
}

#svg_out_flame {
  width: 100%;
  height: calc((100vh - 150px) - 50px);
  /* width: calc((100vw - 350px) - 40px);
  height: calc((100vh - 150px) - 0px); */
  background-color: #f5f5f5;
  overflow: scroll;
}

#svg_in_flame {
  width: 100%;
  height: 100%;
}
</style>
