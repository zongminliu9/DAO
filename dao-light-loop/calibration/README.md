# Calibration data workflow

Production spectral calibration must be dataset-driven and versioned with the optical/mechanical revision.

Recommended input CSV columns:

```text
unit_id,enclosure_rev,source_id,angle_deg,reference_lux,reference_melanopic_edi,reference_cct,f1,f2,f3,f4,f5,f6,f7,f8,clear,nir,gain,integration_ms
```

Workflow:

1. split by source and/or unit into train and held-out sets;
2. normalize raw counts;
3. fit transparent linear/regularized models first;
4. report RMSE, MAE, bias and worst-case error on held-out spectra;
5. inspect error versus angle, intensity and source class;
6. export a versioned coefficient profile;
7. tie the profile to enclosure/optical revision.

Do not tune coefficients against the same spectra used for the final accuracy claim.
