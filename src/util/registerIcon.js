export function registerIcon(name, size, svg) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <symbol id="${name}" viewBox="0 0 ${size} ${size}">
                ${svg}
            </symbol>
        </defs>
    </svg>`
    );
  }