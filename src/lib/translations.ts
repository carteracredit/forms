/**
 * Translation system for the Forms application
 *
 * Supports Spanish (es) and English (en) languages.
 * All UI text should be extracted here for proper i18n support.
 */

export type Language = "es" | "en";

export const translations = {
	en: {
		// Common
		common: {
			back: "Back",
			cancel: "Cancel",
			save: "Save",
			create: "Create",
			edit: "Edit",
			delete: "Delete",
			search: "Search",
			loading: "Loading...",
			required: "Required",
			optional: "Optional",
			submit: "Submit",
			reset: "Reset",
			apply: "Apply",
			close: "Close",
			add: "Add",
			remove: "Remove",
			yes: "Yes",
			no: "No",
			all: "All",
			none: "None",
			actions: "Actions",
			settings: "Settings",
			preview: "Preview",
			details: "Details",
			version: "Version",
			current: "Current",
			status: "Status",
			name: "Name",
			description: "Description",
			type: "Type",
			options: "Options",
			placeholder: "Placeholder",
			label: "Label",
			noResults: "No results found",
			confirm: "Confirm",
			next: "Next",
			previous: "Previous",
			view: "View",
			filter: "Filter",
			export: "Export",
			refresh: "Refresh",
		},

		// App
		app: {
			title: "Form Editor",
			workflowIntegration: "Workflow Integration Platform",
		},

		// Theme
		themeLight: "Light",
		themeDark: "Dark",
		themeSystem: "System",
		themeToggle: "Toggle theme",

		// Language
		languageSpanish: "Español",
		languageEnglish: "English",
		languageToggle: "Toggle language",

		// User Menu
		userAccount: "My Account",
		userProfile: "Profile",
		userLogout: "Log Out",
		userBilling: "Billing",
		userNotifications: "Notifications",

		// Forms List
		formsList: {
			title: "Forms",
			subtitle: "Manage and organize your workflow forms",
			createForm: "Create Form",
			searchPlaceholder: "Search forms...",
			noFormsFound: "No forms found",
			noFormsFoundDesc: "Create your first form to get started",
			tryAdjusting: "Try adjusting your search criteria",
			updated: "Updated",
			viewDetails: "View Details",
			editForm: "Edit Form",
			deleteConfirm: "Are you sure you want to delete this form?",
		},

		// Form Status
		status: {
			all: "All",
			published: "Published",
			draft: "Draft",
			archived: "Archived",
		},

		// Form Detail
		formDetail: {
			previewForm: "Preview Form",
			editForm: "Edit Form",
			formDetails: "Form Details",
			fieldLibrary: "Field Library",
			formFields: "Form Fields",
			noFieldsYet: "No fields configured yet",
			schemaManagement: "Schema Management",
			inputSchema: "Input Schema",
			preFillData: "Pre-fill Data",
			inputSchemaDesc:
				"Define data structure to pre-fill form fields from workflow context",
			outputSchema: "Output Schema",
			responseData: "Response Data",
			outputSchemaDesc: "Data structure of form submission sent to workflow",
			versionHistory: "Version History",
			showAllVersions: "Show All Versions",
			hideVersions: "Hide",
			metadata: "Metadata",
			created: "Created",
			lastUpdated: "Last Updated",
			formId: "Form ID",
			totalVersions: "Total Versions",
			fields: "fields",
			field: "field",
		},

		// Form Editor
		formEditor: {
			editForm: "Edit Form",
			unsavedChanges: "Editing - Unsaved Changes",
			showPreview: "Show Preview",
			hidePreview: "Hide Preview",
			fullPreview: "Full Preview",
			saveVersion: "Save Version",
			addField: "Add Field",
			addNewField: "Add New Field",
			editField: "Edit Field",
			fieldType: "Field Type",
			bilingualLabel: "Field Label (Bilingual)",
			bilingualPlaceholder: "Placeholder Text (Bilingual)",
			english: "English",
			spanish: "Spanish",
			enterLabelEn: "Enter label in English",
			enterLabelEs: "Enter label in Spanish",
			enterPlaceholderEn: "Enter placeholder in English",
			enterPlaceholderEs: "Enter placeholder in Spanish",
			schemaPreview: "Schema Preview",
			input: "Input (Pre-fill)",
			output: "Output",
			properties: "Properties",
			inputSchemaTab: "Input Schema",
			outputSchemaTab: "Output Schema",
			saveNewVersion: "Save New Version",
			changelog: "Changelog",
			changelogPlaceholder: "Describe what changed in this version...",
			noFormSelected: "No form selected",
			livePreview: "Live Preview",
		},

		// Field Types
		fieldTypes: {
			name: "Name Field",
			phone: "Phone Number",
			email: "Email Address",
			text: "Text Field",
			textarea: "Long Text",
			number: "Number",
			url: "URL",
			password: "Password",
			dropdown: "Dropdown",
			date: "Date",
			time: "Time",
			datetime: "Date & Time",
			rating: "Rating",
			address: "Address Field",
			file: "File Upload",
			checkbox: "Checkbox",
			radio: "Radio Buttons",
			"checkbox-group": "Checkbox Group",
			checkboxGroup: "Checkbox Group",
		},

		// Field Properties
		fieldProperties: {
			minLength: "Min Length",
			maxLength: "Max Length",
			showStrength: "Show Strength Indicator",
			min: "Minimum",
			max: "Maximum",
			step: "Step",
			rows: "Rows",
			maxRating: "Max Rating",
			allowHalf: "Allow Half Stars",
			acceptedTypes: "Accepted File Types",
			maxFileSize: "Max File Size (MB)",
			optionsComma: "Options (comma separated)",
			optionsPlaceholder: "Option 1, Option 2, Option 3",
		},

		// Field Library
		fieldLibrary: {
			title: "Field Component Library",
			description:
				"Explore all available form field types, their properties, features, and how they integrate with input/output schemas for workflow automation.",
			nameFieldDesc: "Captures user's full name with proper capitalization",
			phoneFieldDesc:
				"International phone number input with country code selection",
			emailFieldDesc: "Email address input with format validation",
			textFieldDesc: "Single-line text input for short text responses",
			textareaFieldDesc: "Multi-line text input for longer text and paragraphs",
			numberFieldDesc:
				"Numeric input with optional min/max constraints and step control",
			urlFieldDesc: "URL input with format validation and protocol detection",
			passwordFieldDesc:
				"Secure password input with optional strength indicator",
			dropdownFieldDesc:
				"Single-selection dropdown menu from predefined options",
			addressFieldDesc:
				"Structured address input with optional Google Places autocomplete",
			fileFieldDesc:
				"File upload field with drag-and-drop support and file type validation",
			fileUploadDesc:
				"File upload field with drag-and-drop support and file type validation",
			checkboxFieldDesc: "Single checkbox for boolean yes/no responses",
			radioFieldDesc:
				"Single selection from multiple options displayed as radio buttons",
			checkboxGroupFieldDesc:
				"Multiple selection from options displayed as checkboxes",
			checkboxGroupDesc:
				"Multiple selection from options displayed as checkboxes",
			dateFieldDesc:
				"Date selector with calendar picker and date range constraints",
			timeFieldDesc: "Time selector with hour and minute selection",
			datetimeFieldDesc:
				"Combined date and time selection with timezone support",
			ratingFieldDesc: "Star rating input with configurable maximum rating",
			properties: "Properties",
			features: "Features",
			inputSchema: "Input Schema",
			outputSchema: "Output Schema",
			example: "Example",
			displayLabel: "Display label for the field",
			hintText: "Hint text shown in empty field",
			fieldRequired: "Whether field must be filled",
			required: "required",
			useInputSchema:
				"Use this schema to pre-fill the field from workflow data",
			workflowProvidesData: "Workflow provides this data to pre-fill the field",
			dataStructureReturned:
				"Data structure returned to the workflow upon form submission",
			exampleOutput: "Example output",
			phoneFormat: "Phone number format hint",
			emailFormat: "Email address format",
			urlFormat: "URL format hint",
			addressFormat: "Address format hint",
			uploadInstruction: "Upload instruction text",
			minCharCount: "Minimum character count",
			maxCharCount: "Maximum character count",
			minAllowedValue: "Minimum allowed numeric value",
			maxAllowedValue: "Maximum allowed numeric value",
			stepControl: "Increment step for number input",
			visibleRows: "Number of visible textarea rows",
			minPasswordLength: "Minimum password length requirement",
			showStrengthIndicator: "Display password strength indicator",
			noSelectionText: "Text shown when no option selected",
			availableOptions: "List of available options",
			selectionRequired: "Whether a selection is required",
			maxFileSize: "Maximum allowed file size",
			allowedFileTypes: "Permitted file type extensions",
			checkboxLabel: "Label text for checkbox",
			fieldLabel: "Field label text",
			choices: "Available option choices",
			earliestSelectableDate: "Earliest date that can be selected",
			latestSelectableDate: "Latest date that can be selected",
			timeInterval: "Time interval in minutes",
			earliestSelectableDatetime: "Earliest datetime that can be selected",
			latestSelectableDatetime: "Latest datetime that can be selected",
			maxRatingValue: "Maximum rating value (number of stars)",
			allowHalfStar: "Allow half-star ratings",
			autoCapitalization: "Automatic capitalization of first letters",
			trimWhitespace: "Automatic whitespace trimming",
			validationMinChars: "Minimum character validation",
			supportsFullName: "Supports full name with first and last",
			autoFormatting: "Automatic phone number formatting",
			internationalFormat: "International number format support",
			validationPhoneStructure: "Phone number structure validation",
			countryCodeDetection: "Automatic country code detection",
			rfc5322Validation: "RFC 5322 compliant email validation",
			domainVerification: "Domain name verification",
			lowercaseNormalization: "Automatic lowercase normalization",
			duplicateDetection: "Duplicate email detection",
			autoExpandingTextarea: "Automatically expanding textarea height",
			characterCountDisplay: "Real-time character count display",
			minMaxLengthValidation: "Min/max length validation",
			lineBreakPreservation: "Line break preservation in output",
			scrollableForLongContent: "Scrollable area for long content",
			numericKeyboard: "Numeric keyboard on mobile devices",
			minMaxValueValidation: "Min/max value validation",
			decimalSupport: "Decimal number support",
			spinnerControls: "Spinner up/down controls",
			scientificNotationSupport: "Scientific notation support",
			urlFormatValidation: "URL format validation",
			protocolDetection: "Automatic protocol detection (https/http)",
			domainValidation: "Domain name validation",
			autoPrependHttps: "Automatic https:// prepending",
			linkPreview: "Link preview on hover",
			maskedCharacterDisplay: "Masked character display (••••)",
			showHidePasswordToggle: "Show/hide password toggle button",
			passwordStrengthMeter: "Real-time password strength meter",
			lengthValidation: "Password length validation",
			complexityRequirements: "Complexity requirement checks",
			copyPasteProtection: "Optional copy/paste protection",
			searchableOptions: "Searchable options list",
			keyboardNavigation: "Keyboard arrow navigation support",
			customOptionValues: "Custom value for each option",
			groupedOptionsSupport: "Grouped options support",
			compactDisplay: "Compact dropdown display",
			googleMapsAutocomplete: "Google Maps Places autocomplete",
			addressParsing: "Automatic address component parsing",
			geocodingSupport: "Geocoding to lat/lng coordinates",
			internationalAddressFormats: "International address format support",
			dragAndDropUpload: "Drag-and-drop file upload",
			multipleFileSupport: "Multiple file upload support",
			fileTypeValidation: "File type validation",
			sizeLimitEnforcement: "Size limit enforcement",
			previewImagesPDFs: "Preview for images and PDFs",
			uploadProgressTracking: "Upload progress tracking",
			trueFalseCapture: "True/false value capture",
			customStylingSupport: "Custom styling support",
			requiredValidation: "Required validation enforcement",
			singleSelection: "Single selection from options",
			selectedOptionIndication: "Selected option visual indication",
			multipleSelections: "Multiple selections allowed",
			selectAllClearAll: "Select All / Clear All options",
			minMaxSelectionLimits: "Min/max selection count limits",
			nativeDatePicker: "Native date picker interface",
			minMaxDateConstraints: "Min/max date constraints",
			localeAwareFormatting: "Locale-aware date formatting",
			keyboardShortcuts: "Keyboard shortcuts for navigation",
			iso8601Output: "ISO 8601 format output",
			"1224HourFormat": "12/24 hour format support",
			minuteIntervalStepping: "Configurable minute interval stepping",
			keyboardInputSupport: "Direct keyboard time input",
			amPmSelector: "AM/PM selector",
			timezoneAwareness: "Timezone awareness",
			integratedDatePicker: "Integrated date and time picker",
			timezoneSelection: "Timezone selection support",
			dstHandling: "Daylight Saving Time handling",
			iso8601DatetimeFormat: "ISO 8601 datetime format",
			relativeTimeDisplay: "Relative time display (e.g. '2 hours ago')",
			interactiveStarVisualization: "Interactive star visualization",
			hoverPreview: "Hover preview before selection",
			halfStarSupport: "Half-star rating support",
			customMaxRating: "Configurable maximum rating",
			touchFriendly: "Touch-friendly for mobile",
			clearRatingOption: "Option to clear rating",
		},

		// Create Form Dialog
		createForm: {
			title: "Create New Form",
			subtitle: "Start building a new form for your workflow",
			formName: "Form Name",
			formNamePlaceholder: "e.g. Customer Feedback Form",
			descriptionLabel: "Description",
			descriptionPlaceholder: "Describe the purpose of this form...",
		},

		// Preview
		preview: {
			title: "Form Preview",
			back: "Back",
			versionHistory: "Version History",
			viewportSize: "Viewport Size",
			mobile: "Mobile",
			tablet: "Tablet",
			desktop: "Desktop",
			accessibility: "Accessibility",
			accessibilityTools: "Accessibility Tools",
			highContrast: "High Contrast",
			largeText: "Large Text",
			zoom: "Zoom",
			zoomIn: "Zoom In",
			zoomOut: "Zoom Out",
			resetForm: "Reset Form",
			inputSchemaTester: "Input Schema Tester",
			inputSchemaDesc:
				"Edit the JSON below to test form pre-filling with different input data",
			inputSchemaJSON: "Input Schema JSON",
			applyPreFill: "Apply & Pre-fill Form",
			fieldMapping: "Field Mapping",
			outputSchema: "Output Schema",
			backToForm: "Back to Form",
			submitForm: "Submit Form",
		},

		// Theme
		theme: {
			title: "Theme",
			light: "Light",
			dark: "Dark",
			system: "System",
		},

		// Language
		language: {
			title: "Language",
			english: "English",
			spanish: "Spanish",
		},

		// User
		user: {
			avatar: "User avatar",
			myAccount: "My Account",
			profile: "Profile",
			preferences: "Preferences",
			logout: "Log Out",
		},

		// Validation
		validation: {
			required: "This field is required",
			invalidEmail: "Please enter a valid email address",
			invalidUrl: "Please enter a valid URL",
			invalidPhone: "Please enter a valid phone number",
			minLength: "Minimum {min} characters required",
			maxLength: "Maximum {max} characters allowed",
			minValue: "Minimum value is {min}",
			maxValue: "Maximum value is {max}",
			invalidJson: "Invalid JSON",
			invalidJsonFormat: "Invalid JSON format",
		},

		// Address
		address: {
			autocomplete: "Address Autocomplete",
			autocompleteDesc: "Use Google Places to find addresses quickly",
			street: "Street Address",
			streetPlaceholder: "123 Main Street",
			street2: "Apartment, suite, etc.",
			street2Placeholder: "Apt 4B",
			city: "City",
			cityPlaceholder: "San Francisco",
			state: "State / Province",
			statePlaceholder: "CA",
			zip: "ZIP / Postal Code",
			zipPlaceholder: "94102",
			country: "Country",
			countryPlaceholder: "United States",
		},

		// Phone
		phone: {
			placeholder: "Phone number",
		},

		// File Upload
		fileUpload: {
			dragDrop: "Drag & drop files here, or click to select",
			maxSize: "Max file size: {size}MB",
			acceptedTypes: "Accepted types: {types}",
		},

		// Errors
		errorGeneric: "An error occurred",
		errorNotFound: "Not found",
		errorUnauthorized: "Unauthorized",
		errorForbidden: "Access denied",
		errorServerError: "Server error",
		errorNetworkError: "Connection error",

		// Success messages
		successSaved: "Saved successfully",
		successDeleted: "Deleted successfully",
		successCreated: "Created successfully",
		successUpdated: "Updated successfully",

		// Forbidden page
		forbiddenTitle: "Access Denied",
		forbiddenMessage:
			"You do not have permission to access this forms dashboard.",
		forbiddenBack: "Back to home",
	},
	es: {
		// Common
		common: {
			back: "Volver",
			cancel: "Cancelar",
			save: "Guardar",
			create: "Crear",
			edit: "Editar",
			delete: "Eliminar",
			search: "Buscar",
			loading: "Cargando...",
			required: "Requerido",
			optional: "Opcional",
			submit: "Enviar",
			reset: "Restablecer",
			apply: "Aplicar",
			close: "Cerrar",
			add: "Agregar",
			remove: "Eliminar",
			yes: "Sí",
			no: "No",
			all: "Todos",
			none: "Ninguno",
			actions: "Acciones",
			settings: "Configuración",
			preview: "Vista previa",
			details: "Detalles",
			version: "Versión",
			current: "Actual",
			status: "Estado",
			name: "Nombre",
			description: "Descripción",
			type: "Tipo",
			options: "Opciones",
			placeholder: "Marcador de posición",
			label: "Etiqueta",
			noResults: "No se encontraron resultados",
			confirm: "Confirmar",
			next: "Siguiente",
			previous: "Anterior",
			view: "Ver",
			filter: "Filtrar",
			export: "Exportar",
			refresh: "Actualizar",
		},

		// App
		app: {
			title: "Editor de Formularios",
			workflowIntegration: "Plataforma de Integración de Flujos de Trabajo",
		},

		// Theme
		themeLight: "Claro",
		themeDark: "Oscuro",
		themeSystem: "Sistema",
		themeToggle: "Cambiar tema",

		// Language
		languageSpanish: "Español",
		languageEnglish: "English",
		languageToggle: "Cambiar idioma",

		// User Menu
		userAccount: "Mi Cuenta",
		userProfile: "Perfil",
		userLogout: "Cerrar Sesión",
		userBilling: "Facturación",
		userNotifications: "Notificaciones",

		// Forms List
		formsList: {
			title: "Formularios",
			subtitle: "Gestione y organice sus formularios de flujo de trabajo",
			createForm: "Crear Formulario",
			searchPlaceholder: "Buscar formularios...",
			noFormsFound: "No se encontraron formularios",
			noFormsFoundDesc: "Cree su primer formulario para comenzar",
			tryAdjusting: "Intente ajustar sus criterios de búsqueda",
			updated: "Actualizado",
			viewDetails: "Ver Detalles",
			editForm: "Editar Formulario",
			deleteConfirm: "¿Está seguro de que desea eliminar este formulario?",
		},

		// Form Status
		status: {
			all: "Todos",
			published: "Publicado",
			draft: "Borrador",
			archived: "Archivado",
		},

		// Form Detail
		formDetail: {
			previewForm: "Vista Previa",
			editForm: "Editar Formulario",
			formDetails: "Detalles del Formulario",
			fieldLibrary: "Biblioteca de Campos",
			formFields: "Campos del Formulario",
			noFieldsYet: "Aún no hay campos configurados",
			schemaManagement: "Gestión de Esquemas",
			inputSchema: "Esquema de Entrada",
			preFillData: "Datos de Pre-llenado",
			inputSchemaDesc:
				"Define la estructura de datos para pre-llenar campos desde el contexto del flujo",
			outputSchema: "Esquema de Salida",
			responseData: "Datos de Respuesta",
			outputSchemaDesc:
				"Estructura de datos del envío del formulario al flujo de trabajo",
			versionHistory: "Historial de Versiones",
			showAllVersions: "Mostrar Todas las Versiones",
			hideVersions: "Ocultar",
			metadata: "Metadatos",
			created: "Creado",
			lastUpdated: "Última Actualización",
			formId: "ID del Formulario",
			totalVersions: "Total de Versiones",
			fields: "campos",
			field: "campo",
		},

		// Form Editor
		formEditor: {
			editForm: "Editar Formulario",
			unsavedChanges: "Editando - Cambios sin guardar",
			showPreview: "Mostrar Vista Previa",
			hidePreview: "Ocultar Vista Previa",
			fullPreview: "Vista Previa Completa",
			saveVersion: "Guardar Versión",
			addField: "Agregar Campo",
			addNewField: "Agregar Nuevo Campo",
			editField: "Editar Campo",
			fieldType: "Tipo de Campo",
			bilingualLabel: "Etiqueta del Campo (Bilingüe)",
			bilingualPlaceholder: "Texto de Marcador (Bilingüe)",
			english: "Inglés",
			spanish: "Español",
			enterLabelEn: "Ingrese etiqueta en inglés",
			enterLabelEs: "Ingrese etiqueta en español",
			enterPlaceholderEn: "Ingrese marcador en inglés",
			enterPlaceholderEs: "Ingrese marcador en español",
			schemaPreview: "Vista Previa del Esquema",
			input: "Entrada (Pre-llenado)",
			output: "Salida",
			properties: "Propiedades",
			inputSchemaTab: "Esquema de Entrada",
			outputSchemaTab: "Esquema de Salida",
			saveNewVersion: "Guardar Nueva Versión",
			changelog: "Registro de Cambios",
			changelogPlaceholder: "Describe qué cambió en esta versión...",
			noFormSelected: "Ningún formulario seleccionado",
			livePreview: "Vista Previa en Vivo",
		},

		// Field Types
		fieldTypes: {
			name: "Campo de Nombre",
			phone: "Número de Teléfono",
			email: "Correo Electrónico",
			text: "Campo de Texto",
			textarea: "Texto Largo",
			number: "Número",
			url: "URL",
			password: "Contraseña",
			dropdown: "Desplegable",
			date: "Fecha",
			time: "Hora",
			datetime: "Fecha y Hora",
			rating: "Calificación",
			address: "Campo de Dirección",
			file: "Carga de Archivo",
			checkbox: "Casilla de Verificación",
			radio: "Botones de Radio",
			"checkbox-group": "Grupo de Casillas",
			checkboxGroup: "Grupo de Casillas",
		},

		// Field Properties
		fieldProperties: {
			minLength: "Longitud Mínima",
			maxLength: "Longitud Máxima",
			showStrength: "Mostrar Indicador de Seguridad",
			min: "Mínimo",
			max: "Máximo",
			step: "Incremento",
			rows: "Filas",
			maxRating: "Calificación Máxima",
			allowHalf: "Permitir Medias Estrellas",
			acceptedTypes: "Tipos de Archivo Aceptados",
			maxFileSize: "Tamaño Máximo (MB)",
			optionsComma: "Opciones (separadas por coma)",
			optionsPlaceholder: "Opción 1, Opción 2, Opción 3",
		},

		// Field Library
		fieldLibrary: {
			title: "Biblioteca de Componentes de Campo",
			description:
				"Explore todos los tipos de campos de formulario disponibles, sus propiedades, características y cómo se integran con esquemas de entrada/salida para automatización de flujos de trabajo.",
			nameFieldDesc:
				"Captura el nombre completo del usuario con capitalización adecuada",
			phoneFieldDesc:
				"Entrada de número de teléfono internacional con selección de código de país",
			emailFieldDesc:
				"Entrada de dirección de correo electrónico con validación de formato",
			textFieldDesc:
				"Entrada de texto de una sola línea para respuestas de texto corto",
			textareaFieldDesc:
				"Entrada de texto multilínea para texto más largo y párrafos",
			numberFieldDesc:
				"Entrada numérica con restricciones opcionales de mín/máx y control de paso",
			urlFieldDesc:
				"Entrada de URL con validación de formato y detección de protocolo",
			passwordFieldDesc:
				"Entrada de contraseña segura con indicador de fortaleza opcional",
			dropdownFieldDesc:
				"Menú desplegable de selección única con opciones predefinidas",
			addressFieldDesc:
				"Entrada de dirección estructurada con autocompletado opcional de Google Places",
			fileFieldDesc:
				"Campo de carga de archivos con soporte de arrastrar y soltar y validación de tipo de archivo",
			fileUploadDesc:
				"Campo de carga de archivos con soporte de arrastrar y soltar y validación de tipo de archivo",
			checkboxFieldDesc:
				"Casilla de verificación única para respuestas booleanas sí/no",
			radioFieldDesc:
				"Selección única de múltiples opciones mostradas como botones de radio",
			checkboxGroupFieldDesc:
				"Selección múltiple de opciones mostradas como casillas de verificación",
			checkboxGroupDesc:
				"Selección múltiple de opciones mostradas como casillas de verificación",
			dateFieldDesc:
				"Selector de fecha con selector de calendario y restricciones de rango de fechas",
			timeFieldDesc: "Selector de tiempo con selección de hora y minuto",
			datetimeFieldDesc:
				"Selección combinada de fecha y hora con soporte de zona horaria",
			ratingFieldDesc:
				"Entrada de calificación por estrellas con calificación máxima configurable",
			properties: "Propiedades",
			features: "Características",
			inputSchema: "Esquema de Entrada",
			outputSchema: "Esquema de Salida",
			example: "Ejemplo",
			displayLabel: "Etiqueta visible del campo",
			hintText: "Texto de ayuda mostrado en campo vacío",
			fieldRequired: "Si el campo debe completarse",
			required: "requerido",
			useInputSchema:
				"Use este esquema para pre-llenar el campo desde datos del flujo",
			workflowProvidesData:
				"El flujo proporciona estos datos para pre-llenar el campo",
			dataStructureReturned:
				"Estructura de datos devuelta al flujo al enviar el formulario",
			exampleOutput: "Ejemplo de salida",
			phoneFormat: "Formato de número de teléfono",
			emailFormat: "Formato de correo electrónico",
			urlFormat: "Formato de URL",
			addressFormat: "Formato de dirección",
			uploadInstruction: "Texto de instrucción de carga",
			minCharCount: "Cantidad mínima de caracteres",
			maxCharCount: "Cantidad máxima de caracteres",
			minAllowedValue: "Valor numérico mínimo permitido",
			maxAllowedValue: "Valor numérico máximo permitido",
			stepControl: "Incremento para entrada numérica",
			visibleRows: "Número de filas visibles del área de texto",
			minPasswordLength: "Longitud mínima de contraseña",
			showStrengthIndicator: "Mostrar indicador de fortaleza de contraseña",
			noSelectionText: "Texto cuando no hay opción seleccionada",
			availableOptions: "Lista de opciones disponibles",
			selectionRequired: "Si se requiere una selección",
			maxFileSize: "Tamaño máximo de archivo permitido",
			allowedFileTypes: "Extensiones de archivo permitidas",
			checkboxLabel: "Texto de etiqueta de la casilla",
			fieldLabel: "Texto de etiqueta del campo",
			choices: "Opciones disponibles",
			earliestSelectableDate: "Fecha más temprana seleccionable",
			latestSelectableDate: "Fecha más reciente seleccionable",
			timeInterval: "Intervalo de tiempo en minutos",
			earliestSelectableDatetime: "Fecha y hora más temprana seleccionable",
			latestSelectableDatetime: "Fecha y hora más reciente seleccionable",
			maxRatingValue: "Valor máximo de calificación (número de estrellas)",
			allowHalfStar: "Permitir medias estrellas",
			autoCapitalization: "Capitalización automática de primeras letras",
			trimWhitespace: "Recorte automático de espacios",
			validationMinChars: "Validación de caracteres mínimos",
			supportsFullName: "Soporta nombre completo con nombre y apellido",
			autoFormatting: "Formato automático de número de teléfono",
			internationalFormat: "Soporte de formato internacional",
			validationPhoneStructure: "Validación de estructura de teléfono",
			countryCodeDetection: "Detección automática de código de país",
			rfc5322Validation: "Validación de email conforme a RFC 5322",
			domainVerification: "Verificación de dominio",
			lowercaseNormalization: "Normalización a minúsculas",
			duplicateDetection: "Detección de correos duplicados",
			autoExpandingTextarea: "Expansión automática del área de texto",
			characterCountDisplay: "Contador de caracteres en tiempo real",
			minMaxLengthValidation: "Validación de longitud mín/máx",
			lineBreakPreservation: "Preservación de saltos de línea en salida",
			scrollableForLongContent: "Área con scroll para contenido largo",
			numericKeyboard: "Teclado numérico en dispositivos móviles",
			minMaxValueValidation: "Validación de valor mín/máx",
			decimalSupport: "Soporte de números decimales",
			spinnerControls: "Controles de incremento/decremento",
			scientificNotationSupport: "Soporte de notación científica",
			urlFormatValidation: "Validación de formato URL",
			protocolDetection: "Detección automática de protocolo (https/http)",
			domainValidation: "Validación de nombre de dominio",
			autoPrependHttps: "Añadir https:// automáticamente",
			linkPreview: "Vista previa del enlace al pasar el cursor",
			maskedCharacterDisplay: "Caracteres enmascarados (••••)",
			showHidePasswordToggle: "Botón mostrar/ocultar contraseña",
			passwordStrengthMeter: "Indicador de fortaleza en tiempo real",
			lengthValidation: "Validación de longitud de contraseña",
			complexityRequirements: "Comprobación de requisitos de complejidad",
			copyPasteProtection: "Protección opcional contra copiar/pegar",
			searchableOptions: "Lista de opciones buscable",
			keyboardNavigation: "Navegación con teclado",
			customOptionValues: "Valor personalizado por opción",
			groupedOptionsSupport: "Soporte de opciones agrupadas",
			compactDisplay: "Visualización compacta",
			googleMapsAutocomplete: "Autocompletado de Google Maps Places",
			addressParsing: "Análisis automático de componentes de dirección",
			geocodingSupport: "Geocodificación a coordenadas lat/lng",
			internationalAddressFormats: "Formatos de dirección internacionales",
			dragAndDropUpload: "Carga por arrastrar y soltar",
			multipleFileSupport: "Carga de múltiples archivos",
			fileTypeValidation: "Validación de tipo de archivo",
			sizeLimitEnforcement: "Cumplimiento del límite de tamaño",
			previewImagesPDFs: "Vista previa de imágenes y PDFs",
			uploadProgressTracking: "Seguimiento del progreso de carga",
			trueFalseCapture: "Captura de valor verdadero/falso",
			customStylingSupport: "Soporte de estilos personalizados",
			requiredValidation: "Validación de campo requerido",
			singleSelection: "Selección única de opciones",
			selectedOptionIndication: "Indicación visual de opción seleccionada",
			multipleSelections: "Se permiten múltiples selecciones",
			selectAllClearAll: "Seleccionar todo / Limpiar todo",
			minMaxSelectionLimits: "Límites de cantidad de selección",
			nativeDatePicker: "Selector de fecha nativo",
			minMaxDateConstraints: "Restricciones de fecha mín/máx",
			localeAwareFormatting: "Formato de fecha según locale",
			keyboardShortcuts: "Atajos de teclado para navegación",
			iso8601Output: "Salida en formato ISO 8601",
			"1224HourFormat": "Soporte de formato 12/24 horas",
			minuteIntervalStepping: "Intervalo de minutos configurable",
			keyboardInputSupport: "Entrada directa de hora por teclado",
			amPmSelector: "Selector AM/PM",
			timezoneAwareness: "Conciencia de zona horaria",
			integratedDatePicker: "Selector integrado de fecha y hora",
			timezoneSelection: "Soporte de selección de zona horaria",
			dstHandling: "Manejo de horario de verano",
			iso8601DatetimeFormat: "Formato de fecha y hora ISO 8601",
			relativeTimeDisplay: "Visualización relativa (ej. 'hace 2 horas')",
			interactiveStarVisualization: "Visualización interactiva de estrellas",
			hoverPreview: "Vista previa al pasar el cursor",
			halfStarSupport: "Soporte de medias estrellas",
			customMaxRating: "Calificación máxima configurable",
			touchFriendly: "Optimizado para pantallas táctiles",
			clearRatingOption: "Opción para borrar calificación",
		},

		// Create Form Dialog
		createForm: {
			title: "Crear Nuevo Formulario",
			subtitle:
				"Comienza a construir un nuevo formulario para tu flujo de trabajo",
			formName: "Nombre del Formulario",
			formNamePlaceholder: "ej. Formulario de Comentarios del Cliente",
			descriptionLabel: "Descripción",
			descriptionPlaceholder: "Describe el propósito de este formulario...",
		},

		// Preview
		preview: {
			title: "Vista Previa del Formulario",
			back: "Volver",
			versionHistory: "Historial de Versiones",
			viewportSize: "Tamaño de Pantalla",
			mobile: "Móvil",
			tablet: "Tableta",
			desktop: "Escritorio",
			accessibility: "Accesibilidad",
			accessibilityTools: "Herramientas de Accesibilidad",
			highContrast: "Alto Contraste",
			largeText: "Texto Grande",
			zoom: "Zoom",
			zoomIn: "Acercar",
			zoomOut: "Alejar",
			resetForm: "Restablecer Formulario",
			inputSchemaTester: "Probador de Esquema de Entrada",
			inputSchemaDesc:
				"Edita el JSON para probar el pre-llenado del formulario con diferentes datos",
			inputSchemaJSON: "JSON del Esquema de Entrada",
			applyPreFill: "Aplicar y Pre-llenar",
			fieldMapping: "Mapeo de Campos",
			outputSchema: "Esquema de Salida",
			backToForm: "Volver al Formulario",
			submitForm: "Enviar Formulario",
		},

		// Theme
		theme: {
			title: "Tema",
			light: "Claro",
			dark: "Oscuro",
			system: "Sistema",
		},

		// Language
		language: {
			title: "Idioma",
			english: "Inglés",
			spanish: "Español",
		},

		// User
		user: {
			avatar: "Avatar de usuario",
			myAccount: "Mi Cuenta",
			profile: "Perfil",
			preferences: "Preferencias",
			logout: "Cerrar Sesión",
		},

		// Validation
		validation: {
			required: "Este campo es obligatorio",
			invalidEmail: "Por favor ingrese una dirección de correo válida",
			invalidUrl: "Por favor ingrese una URL válida",
			invalidPhone: "Por favor ingrese un número de teléfono válido",
			minLength: "Se requieren mínimo {min} caracteres",
			maxLength: "Máximo {max} caracteres permitidos",
			minValue: "El valor mínimo es {min}",
			maxValue: "El valor máximo es {max}",
			invalidJson: "JSON inválido",
			invalidJsonFormat: "Formato JSON inválido",
		},

		// Address
		address: {
			autocomplete: "Autocompletado de Dirección",
			autocompleteDesc:
				"Usa Google Places para encontrar direcciones rápidamente",
			street: "Dirección",
			streetPlaceholder: "Calle Principal 123",
			street2: "Apartamento, suite, etc.",
			street2Placeholder: "Apto 4B",
			city: "Ciudad",
			cityPlaceholder: "Ciudad de México",
			state: "Estado / Provincia",
			statePlaceholder: "CDMX",
			zip: "Código Postal",
			zipPlaceholder: "01000",
			country: "País",
			countryPlaceholder: "México",
		},

		// Phone
		phone: {
			placeholder: "Número de teléfono",
		},

		// File Upload
		fileUpload: {
			dragDrop: "Arrastra y suelta archivos aquí, o haz clic para seleccionar",
			maxSize: "Tamaño máximo: {size}MB",
			acceptedTypes: "Tipos aceptados: {types}",
		},

		// Errors
		errorGeneric: "Ha ocurrido un error",
		errorNotFound: "No encontrado",
		errorUnauthorized: "No autorizado",
		errorForbidden: "Acceso denegado",
		errorServerError: "Error del servidor",
		errorNetworkError: "Error de conexión",

		// Success messages
		successSaved: "Guardado exitosamente",
		successDeleted: "Eliminado exitosamente",
		successCreated: "Creado exitosamente",
		successUpdated: "Actualizado exitosamente",

		// Forbidden page
		forbiddenTitle: "Acceso Denegado",
		forbiddenMessage:
			"No tienes permisos para acceder a este panel de formularios.",
		forbiddenBack: "Volver al inicio",
	},
} as const;

export type TranslationKeys = keyof (typeof translations)["es"];

/**
 * Gets the locale string for a language
 */
export function getLocaleForLanguage(lang: Language): string {
	switch (lang) {
		case "es":
			return "es-ES";
		case "en":
			return "en-US";
	}
}

/**
 * Detects the browser language and returns the closest supported language
 */
export function detectBrowserLanguage(): Language {
	if (typeof navigator === "undefined") return "es";

	const browserLang = navigator.language.toLowerCase();

	if (browserLang.startsWith("en")) return "en";
	if (browserLang.startsWith("es")) return "es";

	return "es"; // Default to Spanish
}
