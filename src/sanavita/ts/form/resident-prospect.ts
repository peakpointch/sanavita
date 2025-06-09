import { FormField } from "@peakflow/form";
import { FieldGroup, FieldGroupValidation } from "@peakflow/form/fieldgroup";
import mapToObject from "@peakflow/utils/maptoobject";
import objectToMap from "@peakflow/utils/objecttomap";

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

export type ProspectValidation = Record<GroupName, FieldGroupValidation<FormField>>;

export interface SerializedProspect {
  personalData?: any;
  doctor?: any;
  health?: any;
  primaryRelative?: any;
  secondaryRelative?: any;
  linkedFields?: any;
  draft?: any;
}

export interface ResidentProspectData {
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
export function prospectMapToObject(prospects: Map<string, ResidentProspect>): any {
  // Convert a ResidentProspect's structure, which contains FieldGroups with fields as Maps
  const prospectsObj: any = {};
  for (const [key, prospect] of prospects) {
    prospectsObj[key] = prospect.serialize();
  }
  return prospectsObj;
}

/**
 * Used to submit a prospect.
 */
export function flattenProspects(prospects: Map<string, ResidentProspect>): any {
  let prospectsObj: any = {};
  let prospectArray = [...prospects.values()];
  for (let i = 0; i < prospectArray.length; i++) {
    let prospect = prospectArray[i];
    prospectsObj = { ...prospectsObj, ...prospect.flatten(`person${i + 1}`) };
  }
  return prospectsObj;
}

interface LinkedField {
  id?: string;
  group: GroupName;
  fields: string[];
}

type LinkedFields = Map<LinkedFieldsId | string, LinkedField>;

export class ResidentProspect {
  public personalData: FieldGroup;
  public doctor: FieldGroup;
  public health: FieldGroup;
  public primaryRelative: FieldGroup;
  public secondaryRelative: FieldGroup;

  public key: string = `person-${crypto.randomUUID()}`;
  public linkedFields: LinkedFields;
  public draft: boolean;

  public static get defaultData(): ResidentProspectData {
    return {
      personalData: new FieldGroup(),
      doctor: new FieldGroup(),
      health: new FieldGroup(),
      primaryRelative: new FieldGroup(),
      secondaryRelative: new FieldGroup(),
      linkedFields: new Map<LinkedFieldsId | string, LinkedField>(),
      draft: false
    }
  }

  constructor(data?: Partial<ResidentProspectData>) {
    const defaults = ResidentProspect.defaultData;
    const resolved = data ?? {};
    this.personalData = resolved.personalData ?? defaults.personalData;
    this.doctor = resolved.doctor ?? defaults.doctor;
    this.health = resolved.health ?? defaults.health;
    this.primaryRelative = resolved.primaryRelative ?? defaults.primaryRelative;
    this.secondaryRelative = resolved.secondaryRelative ?? defaults.secondaryRelative;
    this.linkedFields = resolved.linkedFields ?? defaults.linkedFields;
    this.draft = resolved.draft ?? defaults.draft;
  }

  public linkFields(id: LinkedFieldsId | string, groupName: GroupName, fields: string | string[]): void {
    if (!id) throw new Error(`ResidentProspect "${this.getFullName()}": The group id "${id}" for linking fields is not valid.`);

    let inputIds = fields;
    if (typeof inputIds === "string") {
      inputIds = inputIds
        ?.split(',')
        .map(id => id.trim());
    }

    if (inputIds.length === 0 || inputIds.some(id => id === '')) {
      throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
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
  public validateGroups(...groups: GroupName[]): Partial<ProspectValidation> | ProspectValidation {
    const groupNames = groups.length ? groups : Object.keys(this) as GroupName[];
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
    return !Object.values(validated).some(group => group.isValid === false);
  }

  public getFullName(): string {
    return (
      `${this.personalData.getField("first-name")!.value} ${this.personalData.getField("name")!.value
        }`.trim() || "Neue Person"
    );
  }

  public flatten(prefix: string): Object {
    const fields: any = {};

    const groupNames = Object.keys(this) as GroupName[];
    for (const groupName of groupNames) {
      const group = this[groupName];

      group.fields.forEach((field, index) => {
        const fieldName = `${prefix}_${groupName}_${field.id}`;
        fields[fieldName] = field.value;
      });
    }

    return fields;
  }

  public serialize(): SerializedProspect {
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
   * Main function to deserialize a `ResidentProspect`
   */
  public static deserialize(data: SerializedProspect): ResidentProspect {
    return new ResidentProspect({
      personalData: FieldGroup.deserialize(data.personalData),
      doctor: FieldGroup.deserialize(data.doctor),
      health: FieldGroup.deserialize(data.health),
      primaryRelative: FieldGroup.deserialize(data.primaryRelative),
      secondaryRelative: FieldGroup.deserialize(data.secondaryRelative),
      linkedFields: objectToMap(data.linkedFields),
      draft: data.draft,
    });
  }

  public static areEqual(a: ResidentProspect, b: ResidentProspect): boolean {
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
