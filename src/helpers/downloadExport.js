import { baseApiUrl } from "@openimis/fe-core";
import { EXPORT_FILE_FORMATS } from "../constants";
import { openBlob } from "./api";

export function downloadExport(export_file, filename, fileFormat = EXPORT_FILE_FORMATS.csv) {
  var url = new URL(`${window.location.origin}${baseApiUrl}/core/fetch_export?export=${export_file}`);
  return (dispatch) => {
    fetch(url)
      .then((response) => {
        return response.blob();
      })
      .then((blob) => openBlob(blob, filename, fileFormat))
      .catch((error) => {
        console.error("Export failed, reason: ", error);
      });
  };
}
