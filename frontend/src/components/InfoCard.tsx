import { Cpu } from "lucide-react";
import React from "react";

const InfoCard = ({ icon = <Cpu color="white" />, title = '', value = '' }) => (
  <div className={'infoCard'}>
    {icon}
    <div>
      <div className={'infoCardTitle'}>{title}</div>
      <div className={'infoCardValue'}>{value}</div>
    </div>
  </div>
);

export default InfoCard;
