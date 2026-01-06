/**
 * PostCSS plugin to convert @property declarations to CSS custom properties
 * AND fix shadow utilities for Shadow DOM compatibility
 */
const property_to_custom_prop = () => ({
  postcssPlugin: "postcss-property-to-custom-prop",
  prepare() {
    const properties = [];
    let shadowsProcessed = 0;

    return {
      AtRule: {
        property: (rule) => {
          const property_name = rule.params.match(/--[\w-]+/)?.[0];
          let initial_value = "";

          rule.walkDecls("initial-value", (decl) => {
            initial_value = decl.value;
          });

          if (property_name && initial_value) {
            properties.push({ name: property_name, value: initial_value });
            rule.remove();
          }
        },
      },
      Rule(rule) {
        // Fix shadow utilities for Shadow DOM compatibility
        if (rule.selector.includes("shadow-")) {
          rule.walkDecls((decl) => {
            // Convert complex Tailwind shadow variables to direct values
            if (
              decl.prop === "box-shadow" &&
              (decl.value.includes("var(--tw-") ||
                decl.value.includes("oklab("))
            ) {
              // Handle direct oklab values in box-shadow (when not using variables)
              if (
                decl.value.includes("oklab(") &&
                !decl.value.includes("var(--tw-")
              ) {
                let shadowValue = decl.value;

                // Convert NEW oklab(from rgb()) patterns directly in box-shadow
                shadowValue = shadowValue.replace(
                  /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s+l\s+a\s+b\s*\/\s*(\d+)%\)\)/g,
                  (match, r, g, b, baseAlpha, percentAlpha) => {
                    const alpha = parseFloat(percentAlpha) / 100;
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  }
                );

                shadowValue = shadowValue.replace(
                  /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                  (match, r, g, b, baseAlpha, percentAlpha) => {
                    const alpha = parseFloat(percentAlpha) / 100;
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  }
                );

                shadowValue = shadowValue.replace(
                  /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\)/g,
                  (match, r, g, b, alpha) => {
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  }
                );

                shadowValue = shadowValue.replace(
                  /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                  (match, r, g, b, percentAlpha) => {
                    const alpha = parseFloat(percentAlpha) / 100;
                    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                  }
                );

                decl.value = shadowValue;
                shadowsProcessed++;

                // if (process.env.NODE_ENV !== "production") {
                //   console.log(
                //     `🔧 PostCSS: Fixed direct shadow ${rule.selector} -> ${shadowValue}`
                //   );
                // }
                return; // Don't process further if we handled direct values
              }
              // Extract shadow from --tw-shadow variable if present
              const shadowMatch = decl.value.match(/var\(--tw-shadow\)/);
              if (shadowMatch) {
                // Find the --tw-shadow declaration in the same rule
                rule.walkDecls("--tw-shadow", (shadowDecl) => {
                  // Convert all shadow values dynamically
                  let shadowValue = shadowDecl.value;

                  // NEW: Convert oklab(from rgb()) patterns - Tailwind CSS 4 format
                  // Handle: oklab(from rgb(0 0 0 / 0.1 l a b / 30%))
                  shadowValue = shadowValue.replace(
                    /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s+l\s+a\s+b\s*\/\s*(\d+)%\)\)/g,
                    (match, r, g, b, baseAlpha, percentAlpha) => {
                      const alpha = parseFloat(percentAlpha) / 100;
                      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                  );

                  // Handle: oklab(from rgb(0 0 0 / 0.1) l a b / 30%)
                  shadowValue = shadowValue.replace(
                    /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                    (match, r, g, b, baseAlpha, percentAlpha) => {
                      const alpha = parseFloat(percentAlpha) / 100;
                      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                  );

                  // Handle: oklab(from rgb(0 0 0 / 0.1) l a b)
                  shadowValue = shadowValue.replace(
                    /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\)/g,
                    (match, r, g, b, alpha) => {
                      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                  );

                  // Handle: oklab(from rgb(0 0 0) l a b / 30%)
                  shadowValue = shadowValue.replace(
                    /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                    (match, r, g, b, percentAlpha) => {
                      const alpha = parseFloat(percentAlpha) / 100;
                      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                  );

                  // Convert oklab patterns - extract alpha from oklab(0% 0 0/ALPHA)
                  shadowValue = shadowValue.replace(
                    /oklab\(0% 0 0\/\.(\d+)\)/g,
                    (match, alpha) => {
                      const alphaValue = parseFloat("0." + alpha);
                      return `rgba(0, 0, 0, ${alphaValue})`;
                    }
                  );

                  // Convert oklab patterns with decimal alpha - oklab(0% 0 0/.05)
                  shadowValue = shadowValue.replace(
                    /oklab\(0% 0 0\/(\.\d+)\)/g,
                    (match, alpha) => {
                      const alphaValue = parseFloat(alpha);
                      return `rgba(0, 0, 0, ${alphaValue})`;
                    }
                  );

                  // Convert var(--tw-shadow-color,xxx) patterns
                  shadowValue = shadowValue.replace(
                    /var\(--tw-shadow-color,([^)]+)\)/g,
                    "$1"
                  );

                  // Convert hex colors with alpha to rgba - dynamically parse hex values
                  shadowValue = shadowValue.replace(
                    /#([0-9a-fA-F]{6})([0-9a-fA-F]{2})/g,
                    (match, rgb, alpha) => {
                      const r = parseInt(rgb.substr(0, 2), 16);
                      const g = parseInt(rgb.substr(2, 2), 16);
                      const b = parseInt(rgb.substr(4, 2), 16);
                      const a = parseInt(alpha, 16) / 255;
                      return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
                    }
                  );

                  // Set the box-shadow directly to the converted value
                  decl.value = shadowValue;
                  shadowsProcessed++;

                  // // Debug logging in development
                  // if (process.env.NODE_ENV !== "production") {
                  //   console.log(
                  //     `🔧 PostCSS: Fixed shadow ${rule.selector} -> ${shadowValue}`
                  //   );
                  // }
                });

                // Remove the Tailwind variable declarations as they're no longer needed
                rule.walkDecls((varDecl) => {
                  if (
                    varDecl.prop.startsWith("--tw-shadow") ||
                    varDecl.prop === "--tw-inset-shadow" ||
                    varDecl.prop === "--tw-ring-shadow"
                  ) {
                    varDecl.remove();
                  }
                });
              }
            }

            // Also handle --tw-shadow-color declarations directly
            if (decl.prop === "--tw-shadow-color") {
              // Convert oklab and color-mix patterns in shadow colors
              let colorValue = decl.value;

              // Convert NEW oklab(from rgb()) patterns in color values
              colorValue = colorValue.replace(
                /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s+l\s+a\s+b\s*\/\s*(\d+)%\)\)/g,
                (match, r, g, b, baseAlpha, percentAlpha) => {
                  const alpha = parseFloat(percentAlpha) / 100;
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
              );

              colorValue = colorValue.replace(
                /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                (match, r, g, b, baseAlpha, percentAlpha) => {
                  const alpha = parseFloat(percentAlpha) / 100;
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
              );

              colorValue = colorValue.replace(
                /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\)\s+l\s+a\s+b\)/g,
                (match, r, g, b, alpha) => {
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
              );

              colorValue = colorValue.replace(
                /oklab\(from\s+rgb\((\d+)\s+(\d+)\s+(\d+)\)\s+l\s+a\s+b\s*\/\s*(\d+)%\)/g,
                (match, r, g, b, percentAlpha) => {
                  const alpha = parseFloat(percentAlpha) / 100;
                  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
                }
              );

              // Convert hex with alpha
              colorValue = colorValue.replace(
                /#([0-9a-fA-F]{6})([0-9a-fA-F]{2})/g,
                (match, rgb, alpha) => {
                  const r = parseInt(rgb.substr(0, 2), 16);
                  const g = parseInt(rgb.substr(2, 2), 16);
                  const b = parseInt(rgb.substr(4, 2), 16);
                  const a = parseInt(alpha, 16) / 255;
                  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
                }
              );

              // Convert color-mix patterns
              colorValue = colorValue.replace(
                /color-mix\(in oklab,([^)]+)\)/g,
                (match, content) => {
                  // Parse percentage and convert to rgba
                  const percentMatch = content.match(/(\d+)%/);
                  if (percentMatch) {
                    const percent = parseInt(percentMatch[1]) / 100;
                    return `rgba(0, 0, 0, ${percent})`;
                  }
                  return match;
                }
              );

              decl.value = colorValue;
            }
          });
        }
      },
      OnceExit(root, { Rule, Declaration }) {
        if (properties.length > 0) {
          const root_rule = new Rule({ selector: ":root, :host" });

          for (const prop of properties) {
            root_rule.append(
              new Declaration({
                prop: prop.name,
                value: prop.value,
              })
            );
          }

          // Find the last @import rule
          let lastImportIndex = -1;
          root.each((node, index) => {
            if (node.type === "atrule" && node.name === "import") {
              lastImportIndex = index;
            }
          });

          // Insert after the last @import, or at the beginning if no imports
          if (lastImportIndex >= 0) {
            root.insertAfter(lastImportIndex, root_rule);
          } else {
            root.prepend(root_rule);
          }
        }

        // // Debug logging
        // if (process.env.NODE_ENV !== "production" && shadowsProcessed > 0) {
        //   console.log(
        //     `✅ PostCSS: Processed ${shadowsProcessed} shadow utilities for Shadow DOM`
        //   );
        // }
      },
    };
  },
});

property_to_custom_prop.postcss = true;

module.exports = {
  plugins: [require("@tailwindcss/postcss"), property_to_custom_prop()],
};
