import { FieldGroup } from "@peakflow/form/fieldgroup";
import mapToObject from "@peakflow/maptoobject";
import objectToMap from "@peakflow/objecttomap";

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

export class ResidentProspect {
  personalData: FieldGroup;
  doctor: FieldGroup;
  health: FieldGroup;
  primaryRelative: FieldGroup;
  secondaryRelative: FieldGroup;

  key: string = `person-${crypto.randomUUID()}`;
  linkedFields: Map<LinkedFieldsId | string, string[]>;

  constructor(
    personalData = new FieldGroup(),
    doctor = new FieldGroup(),
    health = new FieldGroup(),
    primaryRelative = new FieldGroup(),
    secondaryRelative = new FieldGroup(),
    linkedFields = new Map<LinkedFieldsId | string, string[]>
  ) {
    this.personalData = personalData;
    this.doctor = doctor;
    this.health = health;
    this.primaryRelative = primaryRelative;
    this.secondaryRelative = secondaryRelative;
    this.linkedFields = linkedFields;
  }

  public linkFields(groupId: LinkedFieldsId | string, fields: string): void {
    if (!groupId) throw new Error(`ResidentProspect "${this.getFullName()}": The group id "${groupId}" for linking fields is not valid.`);

    const inputIds = fields
      ?.split(',')
      .map(id => id.trim());

    if (inputIds.length === 0 || inputIds.some(id => id === '')) {
      throw new Error(`Please specify the ids of the fields you want to link. Ensure no ids are an empty string.`);
    }

    this.linkedFields.set(groupId, inputIds);
  }

  public validate(): boolean {
    let valid = true;

    // Loop over the groups within the `ResidentProspect` object
    const groups = Object.keys(this) as GroupName[];

    groups.forEach((groupName) => {
      const group = this[groupName] as FieldGroup;

      // Assuming the group has a `fields` property
      if (group.fields) {
        group.fields.forEach((field) => {
          if (!(field instanceof FormField)) {
            console.error(
              `Validate Prospect: field object is not of instance "Field"`
            );
            return;
          } else {
            const fieldValid = field.validate(true);
            if (!fieldValid) {
              valid = false;
            }
          }
        });
      }
    });
    return valid;
  }

  public getFullName(): string {
    return (
      `${this.personalData.getField("first-name")!.value} ${this.personalData.getField("name")!.value
        }`.trim() || "Neue Person"
    );
  }

  public serialize(): object {
    return {
      personalData: mapToObject(this.personalData.fields),
      doctor: mapToObject(this.doctor.fields),
      health: mapToObject(this.health.fields),
      primaryRelative: mapToObject(this.primaryRelative.fields),
      secondaryRelative: mapToObject(this.secondaryRelative.fields),
    };
  }

  public flatten(prefix: string): object {
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

  public static areEqual(a: ResidentProspect, b: ResidentProspect): boolean {
    const groups: GroupName[] = [
      "personalData",
      "doctor",
      "health",
      "primaryRelative",
      "secondaryRelative",
    ];

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
