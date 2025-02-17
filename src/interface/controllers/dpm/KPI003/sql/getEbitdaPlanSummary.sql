SELECT
  bc.PLANT_CODE,
  bc.FISCAL_YEAR,
  SUM((IFNULL(bc.OPERATION_INPUT, 0) + IFNULL(bc.MAINTENANCE_INPUT, 0) - (IFNULL(op.OPERATION_COST, 0) + IFNULL(op.MAINTENANCE_COST, 0)))) AS `VALUE`
FROM
  t_basic_charge_plan bc
INNER JOIN
  t_opex_plan op
  ON
    bc.PLANT_CODE = op.PLANT_CODE AND bc.UNIT_CODE = op.UNIT_CODE AND bc.FISCAL_YEAR = op.FISCAL_YEAR
WHERE
  bc.PLANT_CODE = :plantId AND
  %startFiscalYearFilter% AND
  %endFiscalYearFilter% AND
  (bc.OPERATION_INPUT is not null || bc.MAINTENANCE_INPUT is not null) AND
  (op.OPERATION_COST is not null || op.MAINTENANCE_COST is not null)
GROUP BY bc.PLANT_CODE, bc.FISCAL_YEAR
