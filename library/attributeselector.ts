type AttributeSelector = (name: string | null) => string;

/**
 * Excludes a CSS selector from a CSS selector.
 *
 * @param selector The original selector that should exclude specific elements.
 * @param exclusions The selectors to exclude from the original selector.
 * @returns A CSS selector.
 */
function exclude(selector: string, ...exclusions: string[]): string {
  if (exclusions.length === 0) return selector;

  return selector.split(', ').reduce((acc, str) => {
    let separator = acc === "" ? "" : ', ';
    return acc + separator + `${str}:not(${exclusions.join(', ')})`;
  }, "");
}

/**
 * Creates a selector function based on the provided attribute name.
 * The returned selector function can be used to generate a string selector for the given name.
 * If no name is provided, it will return a selector with just the attribute name.
 * 
 * @template T - The type of the name that will be passed to the generated selector function (e.g., string).
 * @param  attrName - The name of the attribute that will be used in the selector.
 * @param [defaultValue=null] - An optional default value for the name, which is `null` by default.
 * @returns A function that generates the selector string based on the provided name.
 */
const createAttribute = <T>(attrName: string, defaultValue: T | null = null, ...exclusions: string[]) => {
  return (name: T | null = defaultValue): string => {
    if (!name) {
      return exclude(`[${attrName}]`, ...exclusions);
    }
    return exclude(`[${attrName}="${name}"]`, ...exclusions);
  };
}

export default createAttribute;
export type { AttributeSelector };
