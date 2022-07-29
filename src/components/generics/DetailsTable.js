import React from 'react'

function DetailsTable({code,type,validFrom}){
    let list = [
        {code: code, type:type, validFrom:validFrom},
    ]
    return <p><table style={{marginLeft: 20, marginTop: 10}}>
        <tr >
            <td align='left'>Code</td>
            <td align='left'>Type</td>
            <td align='left'>Valid from</td>
        </tr>
        {list.map((val, key) => {
            return (
                <tr key={key}>
                    <td width={150}>{val.code}</td>
                    <td width={150}>{val.type}</td>
                    <td width={150}>{val.validFrom}</td>
                </tr>
            )
        })}
  </table></p>
}

export default DetailsTable