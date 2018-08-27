import React from 'react';
import {Card, CardBody, CardHeader} from 'reactstrap';

import {Table} from 'components/Table';
import TableActions from 'components/Table/TableActions';
import Confirm from 'components/Dialogs/Confirm';
import Loader from 'components/Loader';
import CardActions from './actions';
import queryFilters from 'utils/query-filters';
import notify from 'utils/notify';
import date from 'utils/date';
import getErrorMessage from 'utils/getErrorMessage';
import {loadServices, destroyService} from 'requests/services';

class Component extends React.Component {
  state = {
    data: [],
    meta: {},
    isLoading: false,
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.search !== this.props.location.search) {
      this.load();
    }
  }

  load = async () => {
    try {
      this.setState({isLoading: true});
      const {data, meta} = await loadServices(queryFilters());
      this.setState({
        data,
        meta,
        isLoading: false,
      });
    } catch (err) {
      this.setState({isLoading: false}, () => {
        notify({
          type: 'error',
          text: getErrorMessage(err),
        });
      });
    }
  };

  get loader() {
    return this.state.isLoading && <Loader show />;
  }

  get headers() {
    return ['ID', 'Name', 'System', 'Archived', 'Updated', 'Actions'];
  }

  getTableActions() {}

  onConfirm = ({payload, type}) => {
    if (type === 'delete') return destroyService(payload.id);
  };

  getTableActions = payload => {
    return [
      {label: 'Show Information', href: `/services/${payload.id}`},
      {label: 'Edit Information', href: `/services/${payload.id}/edit`},
      {label: 'Divider', type: 'divider'},
      {
        label: 'Delete Record',
        type: 'delete',
        color: 'text-danger',
      },
    ];
  };

  onClickAction = data => {
    if (data.type === 'delete') {
      this.confirm.open({
        isOpen: true,
        title: 'Delete',
        content: 'Are you sure want to delete item?',
        payload: data,
      });
      return;
    }
  };

  renderItem = item => {
    return (
      <tr key={item.id}>
        <td>{item.id}</td>
        <td>{item.name}</td>
        <td>{item.is_default ? 'Yes' : 'No'}</td>
        <td>{item.is_archived ? 'Yes' : 'No'}</td>
        <td>{date(item.updated_at)}</td>
        <td>
          <div className="d-flex justify-content-center">
            <TableActions
              buttonLabel="Actions"
              payload={item}
              items={this.getTableActions(item)}
              onClick={this.onClickAction}
            />
          </div>
        </td>
      </tr>
    );
  };

  render() {
    return (
      <Card>
        <CardHeader>Manage Services</CardHeader>
        <CardActions isLoading={this.state.isLoading} />
        <CardBody className="position-relative">
          {this.loader}
          <Table headers={this.headers}>
            {this.state.data.map(item => {
              return this.renderItem(item);
            })}
          </Table>

          <Confirm
            ref={confirm => (this.confirm = confirm)}
            onSubmit={this.onConfirm}
            onAfterSubmit={this.load}
          />
        </CardBody>
      </Card>
    );
  }
}

export default Component;
