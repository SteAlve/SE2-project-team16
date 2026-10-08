import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

import ServiceCard from "../cards/ServiceCard/ServiceCard";

function ServiceGrid() {

  // TODO: placeholder mock data used only to render the layout.
  // Remove it once the logic to fetch the services from the backend is implemented.
  const services = [
    {
      id: 1,
      name: "Service name",
    },
    {
      id: 2,
      name: "Service name",
    },
    {
      id: 3,
      name: "Service name",
    },
    {
      id: 4,
      name: "Service name",
    },
    {
      id: 5,
      name: "Service name",
    },
    {
      id: 6,
      name: "Service name",
    },
    {
      id: 7,
      name: "Service name",
    },
    {
      id: 8,
      name: "Service name",
    },
    {
      id: 9,
      name: "Service name",
    },
    {
      id: 10,
      name: "Service name",
    },
    {
      id: 11,
      name: "Service name",
    },
    {
      id: 12,
      name: "Service name",
    },
  ];

  return (
      <Row>
        {services.map((service) => (
          <Col key={service.id} xs={12} sm={6} className="d-flex justify-content-center align-items-center">
            <ServiceCard
              name={service.name}
            />
          </Col>
        ))}
      </Row>
  );
}

export default ServiceGrid;