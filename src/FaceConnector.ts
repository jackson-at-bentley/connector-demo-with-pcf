import { DefinitionModel, DefinitionPartition, LinkModel, LinkPartition, PhysicalModel, PhysicalPartition, PhysicalElement } from "@itwin/core-backend";
import * as pcf from "@itwin/pcf";
import * as aspects from "./dmos/ElementAspects";
import * as elements from "./dmos/Elements";
import * as relationships from "./dmos/Relationships";
import * as relatedElements from "./dmos/RelatedElements";
import * as path from "path";

export const Parcel: pcf.ElementDMO = {
  irEntity: "parcel",
  ecElement: "Generic:PhysicalObject",
  modifyProps(_: pcf.PConnector, props: any, instance: pcf.IRInstance) {
    props.userLabel = instance.key;
  },
  categoryAttr: "category",
};

export const ParcelCategory: pcf.ElementDMO = {
  irEntity: "parcels",
  ecElement: "BisCore:SpatialCategory",
};

export class FaceConnector extends pcf.PConnector {
  public async form() {
    new pcf.PConnectorConfig(this, {
      connectorName: "face-connector",
      appId: "face-connector",
      appVersion: "1",
      domainSchemaPaths: [
        path.join(__dirname, "../node_modules/@bentley/generic-schema/Generic.ecschema.xml"),
      ],
    });

    const subject = new pcf.SubjectNode(this, {
      key: "parcel_subject"
    });

    const linkModel = new pcf.ModelNode(this, {
      key: "loader_link_model",
      subject: subject,
      modelClass: LinkModel,
      partitionClass: LinkPartition
    });

    const loader = new pcf.LoaderNode(this, {
      key: "sample_json_loader",
      model: linkModel,
      loader: new pcf.JSONLoader({
        format: "json",
        entities: ["parcel", "parcels"],
        relationships: [],
        defaultPrimaryKey: "key",
      }),
    });

    const physicalModel = new pcf.ModelNode(this, {
      key: "parcel_model",
      subject,
      modelClass: PhysicalModel,
      partitionClass: PhysicalPartition,
    });

    const categoryDefinition = new pcf.ModelNode(this, {
      key: "parcel_category_model",
      subject,
      modelClass: DefinitionModel,
      partitionClass: DefinitionPartition,
    });

    const parcelCategory = new pcf.ElementNode(this, {
      key: "long_parcels",
      model: categoryDefinition,
      dmo: ParcelCategory
    });

    const first_parcel = new pcf.ElementNode(this, {
      key: "first_parcel",
      model: physicalModel,
      dmo: Parcel,
      category: parcelCategory
    });
  }

}

export async function getConnectorInstance() {
  const connector = new FaceConnector();
  await connector.form();
  return connector;
}
