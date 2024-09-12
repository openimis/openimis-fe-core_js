import React from "react";

function DetailsTable({ code, type, validFrom }) {
  const details = [{ code, type, validFrom }];

  return (
    <table style={{ marginLeft: 20, marginTop: 10 }}>
      {details.map(({ code, type, validFrom }) => {
        return (
          <tr key={code}>
            <td width={150}>{code}</td>
            <td width={150}>{type}</td>
            <td width={150}>{validFrom}</td>
          </tr>
        );
      })}
    </table>
  );
}

export default DetailsTable;
