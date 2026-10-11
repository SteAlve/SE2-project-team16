import { useState } from "react";
import Card from "react-bootstrap/Card";
import notFoundImage from "../../../assets/image-not-found.jpg";
import "./service-card.css";

function ServiceCard({ name, image, onClick }) {
  // Show the fallback when the service has no image or the image fails to load.
  const [failed, setFailed] = useState(false);
  const src = image && !failed ? image : notFoundImage;

  return (
    <Card
      className="service-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <Card.Body>
        <div className="service-image">
          <img src={src} alt={name} onError={() => setFailed(true)} />
        </div>

        <Card.Title className="service-name">
          {name}
        </Card.Title>
      </Card.Body>
    </Card>
  );
}

export default ServiceCard;
