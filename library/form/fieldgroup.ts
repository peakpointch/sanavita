import { FormField } from "@library/form/formfield";

export class FieldGroup {
  public fields: Map<string, FormField>;

  constructor(fields: Map<string, FormField> = new Map()) {
    this.fields = fields;
  }

  /**
   * Finds a specific `FormField` instance by id.
   *
   * @param fieldId The id attribute of the associated DOM element.
   */
  public getField(fieldId: string): FormField | undefined {
    return this.fields.get(fieldId);
  }
}

