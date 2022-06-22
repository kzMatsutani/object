<template>
    <div class="card m-2" v-if="flag">
        <div class="card-body m-1 p-0">
            <h5 class="card-title">プロパティ</h5>
            <table>
                <tr>
                    <td style="width: 40px"><label class="mb-0">X</label></td>
                    <td>：</td>
                    <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                </tr>
                <tr>
                    <td><label class="mb-0">Y</label></td>
                    <td>：</td>
                    <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                </tr>
                <tr>
                    <td><label class="mb-0">幅</label></td>
                    <td>：</td>
                    <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                </tr>
                <tr>
                    <td><label class="mb-0">高さ</label></td>
                    <td>：</td>
                    <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                </tr>
                <tr>
                    <td><label class="mb-0">角度</label></td>
                    <td>：</td>
                    <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                </tr>
            </table>
            <div class="mt-3" v-if="object_type = 'text'">
                <table>
                    <tr>
                        <td colspan="3">テキストオプション</td>
                    </tr>
                    <tr>
                        <td style="width: 60px"><label class="mb-0">サイズ</label></td>
                        <td>：</td>
                        <td><input type="text" :value="object_svg" class="form-control form_standard_props"></td>
                    </tr>
                    <tr>
                        <td style="width: 60px"><label class="mb-0">カラー</label></td>
                        <td>：</td>
                        <td><input type="color" class="form-control form_color_props"></td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "PropertyObject",
    data() {
        return {
            flag: true,
        }
    },
    props: ['object_svg'],
    computed: {

    },
    methods: {

    }
}
</script>

<style>
.prop_textarea {
    width: 100%;
}

.form_standard_props {
    width: 80%;
    height: 30px;
    padding: 3px;
}

.form_color_props {
    border: none;
    padding: 0;
    width: 50px;
    height: 30px;
    
}
</style>