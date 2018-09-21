import React, { Component } from "react";
import "./App.css";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import { requestApi } from "./utils";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import QrReader from "react-qr-reader";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Button from "@material-ui/core/Button";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import logoRaffe from "./logo.svg";
import moment from "moment";
const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#6B973F"
    },
    secondary: {
      main: "#AACE37"
    }
  }
});
class App extends Component {
  state = {
    codNode: "",
    codDevice: "",
    device: {},
    reabastecido: false,
    locais: [],
    errorNode: false,
    erroDevice: false
  };
  handleChange = event => {
    this.setState({ codNode: event.target.value, errorNode: false });
  };
  componentDidMount() {
    requestApi("GET", "/tree/levels/user").then(({ status, content }) => {
      console.log(status, content);
      if (status === 200)
        this.setState({ locais: content.filter(item => item.structural) });
      else if (status === 401)
        window.location = "https://dev.saiot.ect.ufrn.br";
    });
  }
  handleScan = serial => {
    if (serial) {
      console.log(serial);
      requestApi("GET", "/manager/device/filter?serial=" + serial).then(
        ({ status, content }) => {
          console.log(status, content); //ta chegando os dois undefined
          if (status === 200) {
            this.setState({
              codDevice: serial,
              device: content,
              errorNode: !this.state.codNode.length,
              erroDevice: false
            });
          } else {
            this.setState({ erroDevice: true });
          }
          if (status === 401) window.location = "https://dev.saiot.ect.ufrn.br";
        }
      );
      // this.setState({
      //   codDevice: serial,
      //   errorNode: !this.state.codNode.length
      // });
    }
  };
  handleError = err => {
    console.error(err);
  };
  handleSubmit = () => {
    requestApi("PUT", "/manager/device", {
      ...this.state.device,
      codNode: this.state.codNode,
      // ...(this.state.reabastecido ? { supplyData: new Date() } : {}),
      serial: undefined
    }).then(({ status, content }) => {
      console.log(status, content);
      if (status === 200) this.setState({ codDevice: "", device: {} });
      else if (status === 401)
        window.location = "https://dev.saiot.ect.ufrn.br";
    });
  };
  render() {
    let local =
      this.state.locais.length > 0 &&
      this.state.locais.find(item => item.codNode === this.state.codNode);
    let nomeLocal = "";
    local && local.name && (nomeLocal = local.name);
    return (
      <MuiThemeProvider theme={theme}>
        <div style={{ padding: 6, maxWidth: 600, margin: "auto" }}>
          <Grid container spacing={8}>
            <Grid item xs={12}>
              <Paper>
                <div
                  style={{
                    height: 40,
                    padding: 5,
                    backgroundColor: "#AACE37"
                  }}
                >
                  <div
                    style={{
                      width: 280,
                      margin: "auto",
                      height: "100%",
                      display: "flex",
                      alignItems: "center"
                    }}
                  >
                    <img
                      style={{ height: "100%", marginRight: 5 }}
                      src={logoRaffe}
                      alt="raffe"
                    />
                    <h4
                      style={{ color: "#242021", margin: 0, fontWeight: 400 }}
                    >
                      Sistema de alocação de barris
                    </h4>
                  </div>
                </div>
                <div style={{ padding: 10 }}>
                  <FormControl
                    style={{ width: "100%" }}
                    error={this.state.errorNode}
                  >
                    <InputLabel htmlFor="demo-controlled-open-select">
                      Selecionar local
                    </InputLabel>
                    <Select
                      style={{ width: "100%" }}
                      value={this.state.codNode}
                      autoWidth={true}
                      onChange={this.handleChange}
                      inputProps={{
                        name: "codNode",
                        id: "local-select"
                      }}
                    >
                      {this.state.locais.map(item => (
                        <MenuItem key={item.codNode} value={item.codNode}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </Select>{" "}
                  </FormControl>
                  <div style={{ padding: "10px 0", textAlign: "center" }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={this.state.reabastecido}
                          icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                          checkedIcon={<CheckBoxIcon fontSize="small" />}
                          onChange={() =>
                            this.setState({
                              reabastecido: !this.state.reabastecido
                            })
                          }
                        />
                      }
                      label="Barril reabastecido"
                    />
                  </div>
                  {this.state.erroDevice ? (
                    <p style={{ margin: 0, color: "#f44" }}>
                      Ouve um erro ao identificar o dispositivo, verifique se
                      você possui permissão à ele
                    </p>
                  ) : this.state.device.name ? (
                    <p style={{ margin: 0 }}>
                      Dispositivo <strong>{this.state.device.name}</strong> de
                      serial <strong>{this.state.codDevice}</strong>{" "}
                      selecionado.
                      <br />A data de abastecimento foi{" "}
                      <strong>{moment().format("DD/MM/YY")}</strong>.
                    </p>
                  ) : null}
                </div>
                <div style={{ padding: 5 }}>
                  <QrReader
                    facingMode={"environment"}
                    className="qrReader"
                    delay={200}
                    onError={this.handleError}
                    onScan={this.handleScan}
                    style={{ width: "100%" }}
                  />
                </div>
              </Paper>
            </Grid>
          </Grid>
          <Dialog
            open={
              Boolean(this.state.codNode.length) &&
              Boolean(this.state.codDevice.length)
            }
            onClose={() => this.setState({ open: false })}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Confirmação"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Deseja mover o dispositivo{" "}
                <strong>{this.state.device.name}</strong> de serial{" "}
                <strong>{this.state.codDevice}</strong> para o local{" "}
                <strong>{nomeLocal}</strong>{" "}
                <strong>
                  {this.state.reabastecido &&
                    " e colocar a data " +
                      moment().format("DD/MM/YY") +
                      " como data de reabastecimento"}
                </strong>
                ?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ codDevice: "" })}
                color="primary"
              >
                Cancelar
              </Button>
              <Button onClick={this.handleSubmit} color="primary" autoFocus>
                Confirmar
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </MuiThemeProvider>
    );
  }
}

export default App;
