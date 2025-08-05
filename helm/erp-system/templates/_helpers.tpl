{{/*
Expand the name of the chart.
*/}}
{{- define "erp-system.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "erp-system.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "erp-system.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "erp-system.labels" -}}
helm.sh/chart: {{ include "erp-system.chart" . }}
{{ include "erp-system.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "erp-system.selectorLabels" -}}
app.kubernetes.io/name: {{ include "erp-system.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "erp-system.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "erp-system.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Generate microservice deployment template
*/}}
{{- define "erp-system.microservice" -}}
{{- $service := .service -}}
{{- $global := .global -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ $service.name }}
  namespace: {{ $global.namespace }}
  labels:
    {{- include "erp-system.labels" . | nindent 4 }}
    app: {{ $service.name }}
    component: microservice
spec:
  replicas: {{ $service.replicaCount | default $global.common.replicaCount }}
  selector:
    matchLabels:
      app: {{ $service.name }}
  template:
    metadata:
      labels:
        app: {{ $service.name }}
        component: microservice
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "{{ $service.port }}"
        prometheus.io/path: "/actuator/prometheus"
    spec:
      serviceAccountName: {{ include "erp-system.serviceAccountName" . }}
      containers:
      - name: {{ $service.name }}
        image: "{{ $global.imageRegistry }}/{{ $service.image.repository }}:{{ $service.image.tag }}"
        imagePullPolicy: {{ $global.common.image.pullPolicy }}
        ports:
        - containerPort: {{ $service.port }}
          name: http
        env:
        - name: SPRING_PROFILES_ACTIVE
          value: "k8s"
        - name: SERVER_PORT
          value: "{{ $service.port }}"
        - name: MANAGEMENT_ENDPOINTS_WEB_EXPOSURE_INCLUDE
          value: "health,info,metrics,prometheus"
        envFrom:
        - configMapRef:
            name: erp-config
        - secretRef:
            name: erp-secrets
        resources:
          {{- toYaml ($service.resources | default $global.common.resources) | nindent 10 }}
        livenessProbe:
          httpGet:
            path: /actuator/health/liveness
            port: http
          initialDelaySeconds: 60
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /actuator/health/readiness
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        startupProbe:
          httpGet:
            path: /actuator/health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
        volumeMounts:
        - name: logs
          mountPath: /app/logs
        - name: config
          mountPath: /app/config
          readOnly: true
      volumes:
      - name: logs
        emptyDir: {}
      - name: config
        configMap:
          name: erp-config
      {{- with $global.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
---
apiVersion: v1
kind: Service
metadata:
  name: {{ $service.name }}
  namespace: {{ $global.namespace }}
  labels:
    {{- include "erp-system.labels" . | nindent 4 }}
    app: {{ $service.name }}
    component: microservice
spec:
  selector:
    app: {{ $service.name }}
  ports:
  - port: {{ $service.port }}
    targetPort: http
    name: http
  type: ClusterIP
{{- end }}