import {
  FormField,
  FieldGroup,
  FieldGroupValidation,
  SerializedFieldGroup,
  FormArrayItem,
} from "peakflow/form";
import { mapToObject, objectToMap } from "peakflow/utils";

export type GroupName = "personalData" | "doctor" | "health";

type LinkedFieldsId = "phone" | "email" | "address";

export type ResidentValidation = Record<
  GroupName,
  FieldGroupValidation<FormField>
>;

export interface SerializedResident {
  key?: string;
  personalData?: SerializedFieldGroup;
  doctor?: SerializedFieldGroup;
  health?: SerializedFieldGroup;
  linkedFields?: Record<string, LinkedField>;
  draft?: boolean;
}

export interface ResidentData {
  key?: string;
  personalData: FieldGroup;
  doctor: FieldGroup;
  health: FieldGroup;
  linkedFields: LinkedFields;
  draft: boolean;
}

interface LinkedField {
  id?: string;
  group: GroupName;
  fields: string[];
}

type LinkedFields = Map<LinkedFieldsId | string, LinkedField>;

export class Resident extends FormArrayItem {
  public personalData: FieldGroup;
  public doctor: FieldGroup;
  public health: FieldGroup;

  public key: string = `resident-${crypto.randomUUID()}`;
  public linkedFields: LinkedFields;
  public draft: boolean;

  public static get defaultData(): ResidentData {
    return {
      personalData: new FieldGroup(),
      doctor: new FieldGroup(),
      health: new FieldGroup(),
      linkedFields: new Map<LinkedFieldsId | string, LinkedField>(),
      draft: false,
    };
  }

  constructor(data?: Partial<ResidentData>) {
    super();
    const defaults = Resident.defaultData;
    const resolved = data ?? {};
    this.key = data.key ?? this.key;
    this.personalData = resolved.personalData ?? defaults.personalData;
    this.doctor = resolved.doctor ?? defaults.doctor;
    this.health = resolved.health ?? defaults.health;
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
        `Resident "${this.getFullName()}": The group id "${id}" for linking fields is not valid.`,
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

  public validateGroups(): ResidentValidation;
  public validateGroups(...groups: GroupName[]): Partial<ResidentValidation>;
  public validateGroups(
    ...groups: GroupName[]
  ): Partial<ResidentValidation> | ResidentValidation {
    const groupNames = groups.length
      ? groups
      : (Object.keys(this) as GroupName[]);
    const validatedGroups: Partial<ResidentValidation> = {};

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

  public serialize(): SerializedResident {
    return {
      key: this.key,
      personalData: this.personalData.serialize(),
      doctor: this.doctor.serialize(),
      health: this.health.serialize(),
      linkedFields: mapToObject(this.linkedFields),
      draft: this.draft,
    };
  }

  /**
   * Main function to deserialize a `Resident`
   */
  public static deserialize(data: SerializedResident): Resident {
    return new Resident({
      key: data.key,
      personalData: FieldGroup.deserialize(data.personalData),
      doctor: FieldGroup.deserialize(data.doctor),
      health: FieldGroup.deserialize(data.health),
      linkedFields: objectToMap(data.linkedFields),
      draft: data.draft,
    });
  }

  public static areEqual(a: Resident, b: Resident): boolean {
    const groups: GroupName[] = ["personalData", "doctor", "health"];

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
