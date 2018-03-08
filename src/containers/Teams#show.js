import React, { Component } from 'react';
import { fromJS, List, Map } from 'immutable';
import PropTypes from 'prop-types';
import ReactTable from 'react-table';
import 'react-table/react-table.css';
import apiFetch from '../helpers/apiFetch';

let tempId = 0;

const getTempName = () => {
  const name = `temp${tempId}`;
  tempId += 1;
  return name;
};

class TeamShow extends Component {
  constructor() {
    super();
    this.state = {
      acronyms: List([]),
    };
    this.renderEditable = this.renderEditable.bind(this);
    this.add = this.add.bind(this);
    this.update = this.update.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;
    apiFetch(`/api/teams/${id}/acronyms`).then(({ acronyms }) => {
      acronyms = acronyms.map(acronym => Object.assign({}, { meta: { state: 'default' } }, acronym));
      this.updateAcronyms(fromJS(acronyms));
    });
  }

  add(index) {
    const { id: teamId } = this.props.match.params;
    const tempName = getTempName();

    this.updateAcronyms(this.state.acronyms
      .setIn([index, 'meta', 'state'], 'saving')
      .setIn([index, 'meta', 'tempName'], tempName));

    const body = JSON.stringify({
      name: this.state.acronyms.getIn([index, 'name']),
      means: this.state.acronyms.getIn([index, 'means']),
      description: this.state.acronyms.getIn([index, 'description']),
    });

    apiFetch(`/api/teams/${teamId}/acronyms`, {
      method: 'post',
      body,
    }).then(({ id, added_by }) => {
      const newIndex = this.state.acronyms.findIndex(a => a.id === tempName);
      this.updateAcronyms(this.state.acronyms
        .setIn([newIndex, 'meta'], Map({ state: 'default' }))
        .setIn([newIndex, 'id'], id)
        .setIn([newIndex, 'added_by'], added_by));
    });
  }

  update(index) {
  }

  updateAcronyms(acronyms) {
    if (!acronyms.some(acronym => acronym.getIn(['meta', 'new']))) {
      acronyms = acronyms.push(fromJS({
        name: '',
        means: '',
        description: '',
        added_by: '',
        meta: {
          new: true,
          state: 'default',
        },
      }));
    }
    this.setState({ acronyms });
  }


  renderAddRowButton(index) {
    const onClick = () => this.add(index);
    return (<button onClick={onClick}>Add</button>);
  }

  renderEditRowButtons(index) {
    const editing = this.state.acronyms.getIn([index, 'meta', 'state']) === 'editing';
    let buttons;
    if (editing) {
      const add = () => this.update(index);
      const reset = () => {
        const original = this.state.acronyms.getIn([index, 'meta', 'original']);
        this.updateAcronyms(this.state.acronyms
          .setIn([index, 'name'], original.get('name'))
          .setIn([index, 'means'], original.get('means'))
          .setIn([index, 'description'], original.get('description'))
          .setIn([index, 'meta', 'state'], 'default')
          .deleteIn([index, 'meta', 'original']));
      };

      buttons = (
        <div>
          <button onClick={add}>Add</button>
          <button onClick={reset}>Reset</button>
        </div>
      );
    } else {
      const edit = () => {
        const original = Map({
          name: this.state.acronyms.getIn([index, 'name']),
          means: this.state.acronyms.getIn([index, 'means']),
          description: this.state.acronyms.getIn([index, 'description']),
        });
        this.updateAcronyms(this.state.acronyms
          .setIn([index, 'meta', 'state'], 'editing')
          .setIn([index, 'meta', 'original'], original));
      };
      const del = () => {
      };
      buttons = (
        <div>
          <button onClick={edit}>Edit</button>
          <button onClick={del}>Delete</button>
        </div>
      );
    }
    return buttons;
  }

  renderEditable(cellInfo) {
    const { index, column: { id: columnId } } = cellInfo;
    return (
      <div
        style={{ backgroundColor: '#fafafa' }}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          this.updateAcronyms(this.state.acronyms.setIn([index, columnId], e.target.innerHTML));
        }}
        dangerouslySetInnerHTML={{
          __html: this.state.acronyms.getIn([index, columnId]),
        }}
      />
    );
  }

  render() {
    const button = ({ index }) => {
      const addRow = !!this.state.acronyms.getIn([index, 'meta', 'new']);
      return addRow ? this.renderAddRowButton(index) : this.renderEditRowButtons(index);
    };

    const columns = [
      {
        Header: 'Acronym',
        accessor: 'name',
        Cell: this.renderEditable,
      },
      {
        Header: 'Stands For',
        accessor: 'means',
        Cell: this.renderEditable,
      },
      {
        Header: 'Description',
        accessor: 'description',
        Cell: this.renderEditable,
      },
      {
        Header: 'Added By',
        accessor: 'added_by',
        Cell: this.renderEditable,
      },
      {
        Header: '',
        Cell: button,
      },
    ];

    return (
      <div>
        <h1>{`Team ${this.props.team.name}`}</h1>
        <ReactTable
          data={this.state.acronyms.toJS()}
          columns={columns}
        />
      </div>
    );
  }
}

TeamShow.propTypes = {
  team: PropTypes.shape({
    name: PropTypes.string,
    id: PropTypes.string,
  }).isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }).isRequired,
};

export default TeamShow;
