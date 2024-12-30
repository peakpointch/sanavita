import { FormField } from "@library/form/formfield";

export default class FieldGroup {
  public fields: Map<string, FormField>;

  constructor(fields: Map<string, FormField> = new Map()) {
    this.fields = fields;
  }

  // Method to retrieve a field by its id
  getField(fieldId: string): FormField | undefined {
    return this.fields.get(fieldId);
  }
}

