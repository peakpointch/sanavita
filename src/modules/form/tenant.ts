import {
  FormField,
  FieldGroup,
  FieldGroupValidation,
  SerializedFieldGroup,
  FormArrayItem,
} from "peakflow/form";
import { mapToObject, objectToMap } from "peakflow/utils";
import { ContactPerson } from "./contact-person";
import { Resident } from "./resident";

export type GroupName =
  | "personalData"
  | "doctor"
  | "health"
  | "primaryRelative"
  | "secondaryRelative";

type LinkedFieldsId =
  | "heimatort"
  | "phone"
  | "email"
  | "address"
  | "doctor"
  | "primaryRelative"
  | "secondaryRelative";

export type TenantValidation = Record<
  GroupName,
  FieldGroupValidation<FormField>
>;

export interface SerializedTenant {
  personalData?: SerializedFieldGroup;
  doctor?: SerializedFieldGroup;
  health?: SerializedFieldGroup;
  primaryRelative?: SerializedFieldGroup;
  secondaryRelative?: SerializedFieldGroup;
  linkedFields?: Record<string, LinkedField>;
  draft?: boolean;
}

export interface TenantData {
  personalData: FieldGroup;
  doctor: FieldGroup;
  health: FieldGroup;
  primaryRelative: FieldGroup;
  secondaryRelative: FieldGroup;
  linkedFields: LinkedFields;
  draft: boolean;
}

/**
 * Used to save the prospect to local storage.
 */
export function personMapToObject(
  prospects: Map<string, Tenant | Resident | ContactPerson>,
): any {
  // Convert a Person's structure, which contains FieldGroups with fields as Maps
  const prospectsObj: any = {};
  for (const [key, prospect] of prospects) {
    prospectsObj[key] = prospect.serialize();
  }
  return prospectsObj;
}

/**
 * Used to submit a prospect.
 */
export function flattenPeople(
  people: Map<string, Tenant | Resident | ContactPerson>,
): any {
  let peopleObj: any = {};
  let peopleArray = [...people.values()];
  for (let i = 0; i < peopleArray.length; i++) {
    let person = peopleArray[i];
    peopleObj = { ...peopleObj, ...person.flatten(`person${i + 1}`) };
  }
  return peopleObj;
}

interface LinkedField {
  id?: string;
  group: GroupName;
  fields: string[];
}

type LinkedFields = Map<LinkedFieldsId | string, LinkedField>;

export class Tenant extends FormArrayItem {
  public personalData: FieldGroup;
  public doctor: FieldGroup;
  public health: FieldGroup;
  public primaryRelative: FieldGroup;
  public secondaryRelative: FieldGroup;

  public key: string = `person-${crypto.randomUUID()}`;
  public linkedFields: LinkedFields;
  public draft: boolean;

  public static get defaultData(): TenantData {
    return {
      personalData: new FieldGroup(),
      doctor: new FieldGroup(),
      health: new FieldGroup(),
      primaryRelative: new FieldGroup(),
      secondaryRelative: new FieldGroup(),
      linkedFields: new Map<LinkedFieldsId | string, LinkedField>(),
      draft: false,
    };
  }

  constructor(data?: Partial<TenantData>) {
    super();
    const defaults = Tenant.defaultData;
    const resolved = data ?? {};
    this.personalData = resolved.personalData ?? defaults.personalData;
    this.doctor = resolved.doctor ?? defaults.doctor;
    this.health = resolved.health ?? defaults.health;
    this.primaryRelative = resolved.primaryRelative ?? defaults.primaryRelative;
    this.secondaryRelative =
      resolved.secondaryRelative ?? defaults.secondaryRelative;
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
        `Tenant "${this.getFullName()}": The group id "${id}" for linking fields is not valid.`,
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

  public validateGroups(): TenantValidation;
  public validateGroups(...groups: GroupName[]): Partial<TenantValidation>;
  public validateGroups(
    ...groups: GroupName[]
  ): Partial<TenantValidation> | TenantValidation {
    const groupNames = groups.length
      ? groups
      : (Object.keys(this) as GroupName[]);
    const validatedGroups: Partial<TenantValidation> = {};

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

  public serialize(): SerializedTenant {
    return {
      personalData: this.personalData.serialize(),
      doctor: this.doctor.serialize(),
      health: this.health.serialize(),
      primaryRelative: this.primaryRelative.serialize(),
      secondaryRelative: this.secondaryRelative.serialize(),
      linkedFields: mapToObject(this.linkedFields),
      draft: this.draft,
    };
  }

  /**
   * Main function to deserialize a `Tenant`
   */
  public static deserialize(data: SerializedTenant): Tenant {
    return new Tenant({
      personalData: FieldGroup.deserialize(data.personalData),
      doctor: FieldGroup.deserialize(data.doctor),
      health: FieldGroup.deserialize(data.health),
      primaryRelative: FieldGroup.deserialize(data.primaryRelative),
      secondaryRelative: FieldGroup.deserialize(data.secondaryRelative),
      linkedFields: objectToMap(data.linkedFields),
      draft: data.draft,
    });
  }

  public static areEqual(a: Tenant, b: Tenant): boolean {
    const groups: GroupName[] = [
      "personalData",
      "doctor",
      "health",
      "primaryRelative",
      "secondaryRelative",
    ];

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
