import React from 'react';

function Header() {
  return (
    <div id="address-info" className="container-fluid mt-3">
      <h1>Crowdfunding DApp</h1>
          <div className="form-group">
            <label htmlFor="current-address"><strong>Current Address:</strong></label>
            <input type="text" className="form-control " id="current-address" value="0x995BDF5070C3C8e8d5bfcf6487f7c2334616331b586" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="owner-address"><strong>Owner's Address:</strong></label>
            <input type="text" className="form-control" id="owner-address" value="0x8a7E1e28d89349BFD3530F4e4e5Cd19c0539844F56" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="balance"><strong>Balance:</strong></label>
            <input type="text" className="form-control" id="balance" value="0.54" disabled />
          </div>
          <div className="form-group">
            <label htmlFor="collected-fees"><strong>Collected Fees:</strong></label>
            <input type="text" className="form-control" id="collected-fees" value="0.12" disabled />
          </div>
        </div>
  );
}

export default Header;
