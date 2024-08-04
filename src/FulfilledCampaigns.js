import React from 'react';

function FulfilledCampaigns() {
  return (
    <div id="fulfilled-campaigns" className="container-fluid mt-4">
      <h2 className="mb-4">Fulfilled Campaigns</h2>
      <table className="table table-md table-striped table-bordered">
        <thead className="thead-dark">
          <tr>
            <th>Entrepreneur</th>
            <th>Title</th>
            <th>Price</th>
            <th>Backers</th>
            <th>Pledges Left</th>
            <th>Your Pledges</th>
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
          </tr>
          <tr>
            <td>0xe3928acEBE80161951Ea5C00E94bC643FF93e3c3</td>
            <td>Campaign 17</td>
            <td>0.05</td>
            <td>5</td>
            <td>5</td>
            <td>0</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default FulfilledCampaigns;