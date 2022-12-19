import os from 'os';
import { dirname } from 'path';
import finder from 'find-package-json';
import { diag } from '@opentelemetry/api';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SemanticResourceDigmaAttributes } from './semanticResourceDigmaAttributes';

type DigmaAttributesOptions = {
  rootPath: string
  digmaEnvironment?: string
  commitId?: string
  otherPackages: string[]
}

type AttributeValue = string | string[]

type Attributes = Record<string, AttributeValue>

export function digmaAttributes({
  rootPath,
  digmaEnvironment,
  commitId,
  otherPackages,
}: DigmaAttributesOptions) {
  const attributes: Attributes = {};

  const hostname = os.hostname();

  digmaEnvironment = resolveEnvironment(digmaEnvironment, hostname);

  attributes[SemanticResourceAttributes.HOST_NAME] = hostname;
  attributes[SemanticResourceDigmaAttributes.ENVIRONMENT] = digmaEnvironment;
  attributes[SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE] = 'JavaScript';

  if (commitId) {
    attributes[SemanticResourceDigmaAttributes.COMMIT_ID] = commitId;
  }

  if(otherPackages?.length > 0) {
    attributes[SemanticResourceDigmaAttributes.PACKAGE_OTHERS] = otherPackages;
  }

  const f = finder(rootPath);
  const pkg = f.next().value;
  if (pkg) {
    const packagePath = dirname(pkg.__path);
    attributes[SemanticResourceDigmaAttributes.PACKAGE_PATH] = packagePath;
    attributes[SemanticResourceDigmaAttributes.PACKAGE_NAME] = pkg.name!; // pkg.name is mandatory for the instrumentation to function correctly
  } else {
    diag.debug('package detector failed: Unable to find package path at', rootPath);
  }

  return attributes;
} 

/**
 * This function resolves the environment in the following order of precedence:
 * 1. The DEPLOYMENT_ENV environment variable always wins.
 * 2. The passed digmaEnvironment attribute value comes second.
 * 3. The [local] fallback comes last.
 * @param digmaEnvironment The value passed to the digmaAttributes configuration
 * @param hostname 
 * @returns 
 */
function resolveEnvironment(digmaEnvironment: string | undefined, hostname: string): string {
  if (process.env.DEPLOYMENT_ENV !== undefined) {
    digmaEnvironment = process.env.DEPLOYMENT_ENV;
  }

  if (digmaEnvironment === undefined) {
    digmaEnvironment = `${hostname}[local]`;
  }
  
  return digmaEnvironment;
}
