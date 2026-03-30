import {
  FormField,
  FieldGroup,
  FieldGroupValidation,
  SerializedFieldGroup,
  FormArrayItem,
} from "peakflow/form";
import { mapToObject, objectToMap } from "peakflow/utils";

export type GroupName = "personalData";

type LinkedFieldsId = "phone" | "email" | "address";

export type ProspectValidation = Record<
  GroupName,
  FieldGroupValidation<FormField>
>;

export interface SerializedContact {
  key?: string;
  personalData?: SerializedFieldGroup;
  linkedFields?: Record<string, LinkedField>;
  draft?: boolean;
}

export interface ContactData {
  key?: string;
  personalData: FieldGroup;
  linkedFields: LinkedFields;
  draft: boolean;
}

interface LinkedField {
  id?: string;
  group: GroupName;
  fields: string[];
}

type LinkedFields = Map<LinkedFieldsId | string, LinkedField>;

export class ContactPerson extends FormArrayItem {
  public personalData: FieldGroup;

  public key: string = `contact-${crypto.randomUUID()}`;
  public linkedFields: LinkedFields;
  public draft: boolean;

  public static get defaultData(): ContactData {
    return {
      personalData: new FieldGroup(),
      linkedFields: new Map<LinkedFieldsId | string, LinkedField>(),
      draft: false,
    };
  }

  constructor(data?: Partial<ContactData>) {
    super();
    const defaults = ContactPerson.defaultData;
    const resolved = data ?? {};
    this.key = data.key ?? this.key;
    this.personalData = resolved.personalData ?? defaults.personalData;
    this.linkedFields = resolved.linkedFields ?? defaults.linkedFields;
    this.draft = resolved.draft ?? defaults.draft;
  }

  public linkFields(
    id: LinkedFieldsId | string,
    groupName: GroupName,
    fields: string | string[],
  ): void {
    if (!id)
      throw new Error(
        `ResidentProspect "${this.getFullName()}": The group id "${id}" for linking fields is not valid.`,
      );

    let inputIds = fields;
    if (typeof inputIds === "string") {
      inputIds = inputIds?.split(",").map((id) => id.trim());
    }

    if (inputIds.length === 0 || inputIds.some((id) => id === "")) {
      throw new Error(
        `Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`,
      );
    }

    this.linkedFields.set(id, { group: groupName, fields: inputIds });
  }

  /**
   * @returns true if the fields existed and have been unlinked, or false if the fields were not linked.
   */
  public unlinkFields(id: LinkedFieldsId | string): boolean {
    return this.linkedFields.delete(id);
  }

  public validateGroups(): ProspectValidation;
  public validateGroups(...groups: GroupName[]): Partial<ProspectValidation>;
  public validateGroups(
    ...groups: GroupName[]
  ): Partial<ProspectValidation> | ProspectValidation {
    const groupNames = groups.length
      ? groups
      : (Object.keys(this) as GroupName[]);
    const validatedGroups: Partial<ProspectValidation> = {};

    for (const groupName of groupNames) {
      const group = this[groupName];
      if (group instanceof FieldGroup) {
        const { isValid, invalidFields } = group.validate();
        validatedGroups[groupName] = { isValid, invalidFields };
      }
    }

    return validatedGroups;
  }

  public validate(): boolean {
    const validated = this.validateGroups();
    return !Object.values(validated).some((group) => group.isValid === false);
  }

  public getFullName(): string {
    return (
      `${this.personalData.getField("firstName")!.value} ${
        this.personalData.getField("lastName")!.value
      }`.trim() || "Neue Person"
    );
  }

  public flatten(prefix: string): Object {
    const fields: any = {};

    const groupNames = Object.keys(this) as GroupName[];
    for (const groupName of groupNames) {
      const group = this[groupName];

      if (group instanceof FieldGroup) {
        group.fields.forEach((field, index) => {
          const fieldName = `${prefix}_${groupName}_${field.id}`;
          fields[fieldName] = field.value;
        });
      }
    }

    return fields;
  }

  public serialize(): SerializedContact {
    return {
      key: this.key,
      personalData: this.personalData.serialize(),
      linkedFields: mapToObject(this.linkedFields),
      draft: this.draft,
    };
  }

  /**
   * Main function to deserialize a `ResidentProspect`
   */
  public static deserialize(data: SerializedContact): ContactPerson {
    return new ContactPerson({
      key: data.key,
      personalData: FieldGroup.deserialize(data.personalData),
      linkedFields: objectToMap(data.linkedFields),
      draft: data.draft,
    });
  }

  public static areEqual(a: ContactPerson, b: ContactPerson): boolean {
    const groups: GroupName[] = ["personalData"];

    if (!a || !b) return false;

    for (const groupName of groups) {
      const groupA = a[groupName];
      const groupB = b[groupName];

      if (!groupA || !groupB) return false;

      const fieldsA = groupA.fields;
      const fieldsB = groupB.fields;

      if (fieldsA.size !== fieldsB.size) return false;

      for (const [fieldId, fieldA] of fieldsA) {
        const fieldB = fieldsB.get(fieldId);
        if (!fieldB || fieldA.value !== fieldB.value) {
          return false;
        }
      }
    }

    return true;
  }
}
