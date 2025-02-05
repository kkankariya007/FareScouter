import React from "react";
import styled from "styled-components";

const Navbar = () => {
  return (
    <StyledNavbar>
      <div className="container d-flex justify-content-between align-items-center">
        <h1 className="text-white fw-bold">FareScouter | Never miss a Deal</h1>
        <img src="logo.png" alt="Logo" style={{ height: "50px" }} />
      </div>
    </StyledNavbar>
  );
};

const StyledNavbar = styled.nav`
  background-color: #005eb8;
  padding: 10px 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export default Navbar;
