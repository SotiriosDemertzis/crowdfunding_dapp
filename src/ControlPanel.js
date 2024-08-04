import React from 'react';

function ControlPanel() {
  return (
    <div id="control-panel" className="container-fluid mt-4">
      <h2 className="mb-4">Control Panel</h2>
      <button className='btn btn-secondary mb-3'>Withdraw</button>
      <div class="input-group mb-3">
        <button class="btn btn-secondary mr-3" type="button">Change Owner</button>
        <input type="text" class="form-control" placeholder="Enter new owner's wallet address"></input>
      </div>
      <div class="input-group mb-3">
        <button class="btn btn-secondary mr-3" type="button">Ban Entrepreneur</button>
        <input type="text" class="form-control" placeholder="Enter enterpreneur's address" ></input>
      </div>
      <button className='btn btn-danger mb-3'>Destroy Contract</button>
    </div>
  );
}

export default ControlPanel;
