import React from 'react';

function NewCampaign() {
  return (
    <div id="new-campaign" className="container-fluid mt-3">
      <h2>New Campaign</h2>
      <form>
        <div className="form-group">
          <label htmlFor="title"><strong>Title</strong></label>
          <input type="text" className="form-control" id="title" placeholder="Campaign's ID" />
        </div>
        
        <div className="form-group">
          <label htmlFor="pledge-cost"><strong>Pledge Cost</strong></label>
          <input type="number" className="form-control" id="pledge-cost" defaultValue="0.01" step="0.01" />
        </div>
        
        <div className="form-group">
          <label htmlFor="number-of-pledges"><strong>Number of Pledges</strong></label>
          <input type="number" className="form-control" id="number-of-pledges" defaultValue="200" />
        </div>
        
        <button type="submit" className="btn btn-primary mt-2">Create</button>
      </form>
    </div>
  );
}

export default NewCampaign;
