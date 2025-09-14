export function registerIcon(name, size, svg, plugin) {
   plugin.addIcons(` <symbol id="${name}" viewBox="0 0 ${size} ${size}">
                ${svg}
            </symbol>`);

  }