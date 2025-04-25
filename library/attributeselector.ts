type AttributeSelector = (name: string | null) => string;
type AttributeType =
  | 'startsWith'    // ^=
  | 'endsWith'      // $=
  | 'includes'      // *=
  | 'whitespace'    // ~=
  | 'hyphen'        // |=
  | 'exact';        // =

interface AttributeOptions<T> {
  defaultType?: AttributeType;
  defaultValue: T | null;
  exclusions?: string[];
}

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
 * @param attrName - The name of the attribute that will be used in the selector.
 * @param options - Options to configure selector generation.
 * @returns A function that generates the selector string based on the provided name and match type.
 */
const createAttribute = <T>(
  attrName: string,
  options: AttributeOptions<T> = {
    defaultType: 'exact',
    defaultValue: null,
    exclusions: [],
  },
) => {
  return (name: T | null = options.defaultValue, type: AttributeType = options.defaultType): string => {
    if (!name) {
      return exclude(`[${attrName}]`, ...options.exclusions);
    }

    const value = String(name); // Ensure it's a string for selector use
    let selector: string;

    switch (type) {
      case 'startsWith':
        selector = `[${attrName}^="${value}"]`;
        break;
      case 'endsWith':
        selector = `[${attrName}$="${value}"]`;
        break;
      case 'includes':
        selector = `[${attrName}*="${value}"]`;
        break;
      case 'whitespace':
        selector = `[${attrName}~="${value}"]`;
        break;
      case 'hyphen':
        selector = `[${attrName}|="${value}"]`;
        break;
      case 'exact':
      default:
        selector = `[${attrName}="${value}"]`;
        break;
    }

    return exclude(selector, ...(options.exclusions ?? []));
  };
}

export default createAttribute;
export type { AttributeSelector, AttributeType, AttributeOptions };
