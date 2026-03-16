import { body, param } from "express-validator";

export const createInfraccionValidator = [

  body("codigo")
    .isString()
    .notEmpty()
    .withMessage("El código es obligatorio"),

  body("descripcion")
    .isString()
    .notEmpty()
    .withMessage("La descripción es obligatoria"),

  body("articulo_codigo")
    .isString()
    .notEmpty()
    .withMessage("El artículo es obligatorio"),

  body("tipo_sancion")
    .isIn([
      "MONETARIA",
      "SUSPENSION_LICENCIA",
      "INMOVILIZACION",
      "MIXTA"
    ])
    .withMessage("Tipo de sanción inválido"),

  body("valor_multa")
    .isNumeric()
    .withMessage("El valor de la multa debe ser numérico"),

  body("dias_suspension")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Los días deben ser positivos"),

  body("aplica_descuento")
    .optional()
    .isBoolean(),

  body("vigente")
    .optional()
    .isBoolean()
];


export const updateInfraccionValidator = [

  body("codigo").optional().isString(),

  body("descripcion").optional().isString(),

  body("articulo_codigo").optional().isString(),

  body("tipo_sancion")
    .optional()
    .isIn([
      "MONETARIA",
      "SUSPENSION_LICENCIA",
      "INMOVILIZACION",
      "MIXTA"
    ]),

  body("valor_multa")
    .optional()
    .isNumeric(),

  body("dias_suspension")
    .optional()
    .isInt({ min: 0 }),

  body("aplica_descuento")
    .optional()
    .isBoolean(),

  body("vigente")
    .optional()
    .isBoolean()
];

export const idParamValidator = [

  param("id")
    .isUUID()
    .withMessage("El id debe ser un UUID válido")

];

export const changeVigenciaValidator = [

  body("vigente")
    .isBoolean()
    .withMessage("El campo vigente debe ser booleano")

];