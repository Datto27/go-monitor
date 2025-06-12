import { Cpu } from "lucide-react";
import React from "react";

const InfoCard = ({ icon = <Cpu color="white" />, title = '', value = '' }) => (
  <div className={'infoCard'}>
    {icon}
    <div className={'info'}>
      <p className={'infoCardTitle'}>{title}</p>
      <p className={'infoCardValue'}>{value}</p>
    </div>
  </div>
);

export default InfoCard;
