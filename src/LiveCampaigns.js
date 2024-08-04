import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function LiveCampaigns() {
  return (
    <div id="live-campaigns" className="container-fluid mt-4">
      <h2 className="mb-4">Live Campaigns</h2>
      <table className="table table-md table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Entrepreneur</th>
            <th>Title</th>
            <th>Price</th>
            <th>Backers</th>
            <th>Pledges Left</th>
            <th>Your Pledges</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0xe3928acEBE80161951Ea5C00E94bC643FF93e3c3</td>
            <td>Campaign 17</td>
            <td>0.05</td>
            <td>5</td>
            <td>5</td>
            <td>0</td>
            <td>
              <div className="btn-group" role="group" aria-label="Actions">
                <button className='btn btn-success' >Pledge</button>
              </div>
              <div className="btn-group" role='group' aria-label='Actions'>
                <button className='btn btn-danger' style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>0xe3928acEBE80161951Ea5C00E94bC643FF93e3c3</td>
            <td>Campaign 17</td>
            <td>0.05</td>
            <td>5</td>
            <td>5</td>
            <td>0</td>
            <td>
              <div className="btn-group" role="group" aria-label="Actions">
                <button className='btn btn-success' >Pledge</button>
              </div>
              <div className="btn-group" role='group' aria-label='Actions'>
                <button className='btn btn-danger' style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            </td>
          </tr>
          <tr>
            <td>0xe3928acEBE80161951Ea5C00E94bC643FF93e3c3</td>
            <td>Campaign 17</td>
            <td>0.05</td>
            <td>5</td>
            <td>5</td>
            <td>0</td>
            <td>
              <div className="btn-group" role="group" aria-label="Actions">
                <button className='btn btn-success' >Pledge</button>
              </div>
              <div className="btn-group" role='group' aria-label='Actions'>
                <button className='btn btn-danger' style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default LiveCampaigns;
