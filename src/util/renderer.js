import { createApp } from 'vue';
import ElementPlus from 'element-plus';
import Carousel from '../components/carousel.vue';
import style from 'element-plus/dist/index.css';
import carouselcss from '../carousel.css';


const rendereMap = new Map();

export function getRenderer(e) {
    return rendereMap.get(e);
}

export function updateRenderer(e) {
  const doms = document.querySelectorAll("protyle-html");
  doms.forEach((protyle) => {
    if (rendereMap.has(protyle)) {
      return;
    }
    const index = protyle
      .getAttribute("data-content")
      .indexOf('data-plugin="siyuan-plugin-picture-library"');
    if (index < 0) {
        return;
    }
    const content = protyle.getAttribute("data-content");
    const path = /data-path="(.*)"/.exec(content);
    if (!path || !path[1]) {
        return;
    }
    const height = /data-height="(\w+)"/.exec(content);
    if (!height || !height[1]) {
        return;
    }
    const shadowRoot = protyle.shadowRoot;
    const d = shadowRoot.querySelector(
      'div[data-plugin="siyuan-plugin-picture-library"]'
    );
    if (d) {
      d.setAttribute("style", "cursor: initial;");
      const view = createApp(Carousel);
      view.use(ElementPlus);
      view.provide('path', path[1]);
      view.provide('height', height[1]);
      view.mount(d);
      rendereMap.set(protyle, view);
      d.insertAdjacentHTML('afterbegin', `<style>${style}</style>`)
      d.insertAdjacentHTML('afterbegin', `<style>${carouselcss}</style>`)
    }
  });
}