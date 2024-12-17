<template>
  <div class="block text-center">
    <el-carousel :height="height" :autoplay="true" indicator-position="none">
      <el-carousel-item class="" v-for="item in images" :key="item">
        <div class="sppl-carousel-item" :style="getStyle(item)"></div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>
<script setup>
import { ref, inject, onMounted } from "vue";
import { _ } from "../util/i18n";
import { getFiles } from "../storage/file";
import { shuffle } from "lodash";

const path = inject("path");
const height = inject("height");
const size = inject("size");
const sort = inject("sort");

const images = ref([]);

const compare = (a, b) => {
  if (a > b) {
    return 1;
  }
  if (a < b) {
    return -1;
  }
  return 0;
};

const getStyle = (url) => ({
    backgroundImage: `url("${url}")`,
    backgroundSize: size || "contain",
  });

onMounted(() => {
  if (!path) {
    return;
  }
  getFiles(path)
    .then((files) => {
      const pictures = files.filter((f) => f.url && f.isPicture);
      if (!sort) {
        return pictures.map((f) => f.url);
      }
      if (sort === "random") {
        return shuffle(pictures).map((f) => f.url);
      }
      if (sort === "nameIncrease") {
        return pictures
          .sort((a, b) => compare(a.name, b.name))
          .map((f) => f.url);
      }
      if (sort === "nameDecrease") {
        return pictures
          .sort((a, b) => compare(b.name, a.name))
          .map((f) => f.url);
      }
      if (sort === "dateIncrease") {
        return pictures
          .sort((a, b) => compare(a.updated, b.updated))
          .map((f) => f.url);
      }
      return pictures
        .sort((a, b) => compare(b.updated, a.updated))
        .map((f) => f.url);
    })
    .then((urls) => {
      images.value = urls;
    });
});
</script>
