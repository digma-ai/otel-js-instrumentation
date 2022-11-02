# OpenTelemetry JS Instrumentation Digma

[Digma](https://digma.ai/) facilitates continuous feedback by gleaning valuable insights from your code and displaying them in the IDE as you code.

This [OpenTelemetry](https://opentelemetry.io/) instrumentation package for [Node.js](https://nodejs.org/en/) helps Digma analyze your code adding a number of OTEL resource attributes to the spans.

## Prerequisites
*  Node  `version: 8 or above.`

## Installing the module
```sh
npm install @digma/otel-js-instrumentation
```

## Usage

### Setup
- [Instrumenting your OpenTelemetry resource](#instrumenting-your-opentelemetry-resource)
- [Adding instrumentation for specific server frameworks](#adding-instrumentation-for-specific-server-frameworks)
- [Exporting trace data to Digma](#exporting-trace-data-to-digma)
- [Fine tuning and ehhancements](#fine-tuning-and-ehhancements)


### Instrumenting your OpenTelemetry resource

Digma needs to add a few more attributes to your OTEL `Resource`. To update your OTEL setup, simply use the provided `digmaAttributes` function as seen below:

```js
const { digmaAttributes } = require('@digma/otel-js-instrumentation');

const sdk = new opentelemetry.NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'my-service',
    ...digmaAttributes({
      rootPath: __dirname,
    }),
  }),
  spanProcessor: new BatchSpanProcessor(exporter),
  instrumentations: [getNodeAutoInstrumentations()],
});
```

### Adding instrumentation for specific server frameworks

Digma can also generate specifc insights based on the service framework you're using. To do that, we can add  a simple middleware that will save the contexual information needed to map the tracing data to the underlying code in the Span attributes.

Follow the steps in the below links to add Digma's middlware, based on your server framework:

* https://github.com/digma-ai/digma-instrumentation-express 

For example, here  is how you would use Digma's middlware with [Express](https://www.npmjs.com/package/@opentelemetry/instrumentation-express) along with the standard OTEL middlware:

```javascript
const { digmaRouteHandler } = require('@digma/instrumentation-express');

app = express();
app.use(digmaRouteHandler);
app.use('/users', users); // some router example
```

### Exporting trace data to Digma

First, you need to have a Digma backend up and running. You can follow the instructions in the [Digma project repository](https://github.com/digma-ai/digma#running-digma-locally) to quickly get set up using Docker.

You can use a standard OTLP exporter for local deployments:

```javascript

const otlpExporter = new OTLPTraceExporter({
  url: 'http://localhost:5050',
});

```

Alternative, if you're already using a `collector` component you can simply modify its configuration file:

```yaml
exporters:
...
otlp/digma:
    endpoint: "localhost:5050"
    tls:
      insecure: true
service:
  pipelines:
    traces:
      exporters: [otlp/digma, ...]
```

In both cases, set the endpoint value to the URL of the Digma backend.

That's it! You should be good to go.

### Fine tuning and ehhancements

Digma allows you to set additional attributes as a part of setting up the OpenTelemetry Resource, to allow better observability visualization for commits, deployment environments, and more. All of these are optional, but can help provide more context to the colleced traces:

| Options | Input Type  | Attribute Key | Description | Default |
| --- | --- | --- | --- | --- |
| `rootPath` | `string` | [code.package.path, code.package.name]| rooPath describes the absolute path of the package.json file | None 
| `digmaEnvironment` | `string` | digma.environment |  The Environment describes where the running process is deployed. (e.g production, staging, ci) | If no deployment environment is provided, we'll assume this is a local deployment env and mark it using the local hostname. It will be visible to that machine only.
| `commitId` | `string`  | scm.commit.id | The specific commit identifier of the running code. | |
`otherPackages` | `[] string` | code.package.others | Specify additional satellite or infra packages to track | |