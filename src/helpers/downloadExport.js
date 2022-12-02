
import { baseApiUrl } from "@openimis/fe-core";
import { openBlob } from "./api"
export function downloadExport(export_file, filename) {
    var url = new URL(`${window.location.origin}${baseApiUrl}/core/fetch_export?export=${export_file}`);
    return  (dispatch) => {
      fetch(url)
      .then(response => {
        return  response.blob()})
      .then(blob => openBlob(blob, filename, "csv"))                 
      .catch((error) => {
        console.error("Export failed, reason: ", error);
    })
  };
  }