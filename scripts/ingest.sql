
-- Auto-generated SQL for asset ingestion
-- This script will safely insert records into the assets table.
-- It assumes all divisions and locations already exist in the database.

DO $$
DECLARE
    dept_id UUID;
    type_id UUID;
    current_asset_code TEXT;
BEGIN

    -- Insert Asset: AJ991
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ991', 'Jet Air 12000btu Split unit', 'Jet Air 12000btu Split unit', 'B20866363107N00407', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ991';
    END IF;

    -- Insert Asset: AJ447
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ447', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00044', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ447';
    END IF;

    -- Insert Asset: AJ287
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ287', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00089', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ287';
    END IF;

    -- Insert Asset: AJ740
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ740', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00086', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ740';
    END IF;

    -- Insert Asset: AJ967
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ967', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00091', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ967';
    END IF;

    -- Insert Asset: AJ797
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ797', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00043', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ797';
    END IF;

    -- Insert Asset: AJ708
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ708', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00006', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ708';
    END IF;

    -- Insert Asset: AJ824
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ824', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00048', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ824';
    END IF;

    -- Insert Asset: AJ246
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ246', 'Jet Air 60000btu Ceiling and Floor Type', 'Jet Air 60000btu Ceiling and Floor Type', 'C02429241705N00033', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ246';
    END IF;

    -- Insert Asset: AA811
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA811', 'Alliance 22500btu Split Unit', 'Alliance 22500btu Split Unit', '2.40421850127819e+21', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA811';
    END IF;

    -- Insert Asset: AJ862
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ862', 'Jet Air 18000btu Split Unit', 'Jet Air 18000btu Split Unit', 'B33446382502N01682', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ862';
    END IF;

    -- Insert Asset: AJ871
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ871', 'Jet Air 24000btu Split Unit', 'Jet Air 24000btu Split Unit', '11222014000650', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ871';
    END IF;

    -- Insert Asset: AJ296
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ296', 'Jet Air 9000btu Split Unit', 'Jet Air 9000btu Split Unit', 'B20956363110N01090', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ296';
    END IF;

    -- Insert Asset: AT943
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AT943', 'TCL 22500btu Split Unit', 'TCL 22500btu Split Unit', '11018N44070100003899', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AT943';
    END IF;

    -- Insert Asset: AA157
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'AKG';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA157', 'AKG 4 Channel Antennae Distribution system with 2 paddels', 'AKG 4 Channel Antennae Distribution system with 2 paddels', '3009H00160', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA157';
    END IF;

    -- Insert Asset: AA786
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA786', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'H9QMDGQ40H', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA786';
    END IF;

    -- Insert Asset: AA912
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA912', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'LMWNLV2PYT', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA912';
    END IF;

    -- Insert Asset: AA285
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA285', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'H2C5FHCF5M', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA285';
    END IF;

    -- Insert Asset: AA110
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA110', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'G3JH39P2PL', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA110';
    END IF;

    -- Insert Asset: AA210
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA210', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'FN7MWGH972', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA210';
    END IF;

    -- Insert Asset: AA519
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA519', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'JN2VW3KF65', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA519';
    END IF;

    -- Insert Asset: AA535
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA535', 'Apple Ipad - 10th Gen - 64gb', 'Apple Ipad - 10th Gen - 64gb', 'DV4XMY9JJV', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA535';
    END IF;

    -- Insert Asset: AA370
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA370', 'Apple Imac Retina 5K 27inc 2019', 'Apple Imac Retina 5K 27inc 2019', 'C02YC201JV3N', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA370';
    END IF;

    -- Insert Asset: AM692
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AM692', 'Macbook M1 Pro 16gb', 'Macbook M1 Pro 16gb', 'R9D9JQK0X6', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AM692';
    END IF;

    -- Insert Asset: AA251
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA251', 'Apple - Mac Mini M1 2020', 'Apple - Mac Mini M1 2020', 'H2WHH0D1Q6P0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA251';
    END IF;

    -- Insert Asset: SB836
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Speakers';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SB836', 'Bose S1 Pro Speaker', 'Bose S1 Pro Speaker', '079115Z83420368AE', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SB836';
    END IF;

    -- Insert Asset: SB446
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Speakers';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SB446', 'Bose S1 Pro Speaker', 'Bose S1 Pro Speaker', '079115Z81840659AE', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SB446';
    END IF;

    -- Insert Asset: BB674
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB674', 'Black Magic Atem Television Studio HD', 'Black Magic Atem Television Studio HD', '5472497', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB674';
    END IF;

    -- Insert Asset: BB618
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB618', 'Black Magic - Hyperdek Studio Mini', 'Black Magic - Hyperdek Studio Mini', '4751160', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB618';
    END IF;

    -- Insert Asset: BB578
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB578', 'Black Magic - Television Studio HD', 'Black Magic - Television Studio HD', '4777358', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB578';
    END IF;

    -- Insert Asset: BF355
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF355', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'A66016548', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF355';
    END IF;

    -- Insert Asset: BF824
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF824', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'A66016582', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF824';
    END IF;

    -- Insert Asset: BF259
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF259', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'A66016578', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF259';
    END IF;

    -- Insert Asset: BF868
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF868', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'Fujinon TV Zoom XA20sx8.5BERM-K3 lens', 'A66016574', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF868';
    END IF;

    -- Insert Asset: BB555
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB555', 'Black Magic Ursa Mini Pro G2 4K Camara', 'Black Magic Ursa Mini Pro G2 4K Camara', '9062186', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB555';
    END IF;

    -- Insert Asset: BB548
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB548', 'Black Magic Ursa Mini Pro G2 4K Camara', 'Black Magic Ursa Mini Pro G2 4K Camara', '9061322', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB548';
    END IF;

    -- Insert Asset: BB702
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB702', 'Black Magic Ursa Mini Pro G2 4K Camara', 'Black Magic Ursa Mini Pro G2 4K Camara', '9062429', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB702';
    END IF;

    -- Insert Asset: BB798
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB798', 'Black Magic - ATEM 1 M/E Constellation 4K', 'Black Magic - ATEM 1 M/E Constellation 4K', '14149642', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB798';
    END IF;

    -- Insert Asset: BB451
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB451', 'Black Magic - ATEM Television Studio Pro 4K', 'Black Magic - ATEM Television Studio Pro 4K', '9597905', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB451';
    END IF;

    -- Insert Asset: BB827
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB827', 'Black Magic - Hyperdeck Studio 4K Pro', 'Black Magic - Hyperdeck Studio 4K Pro', '11941772', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB827';
    END IF;

    -- Insert Asset: BB571
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB571', 'Black Magic - Web Presenter 4K', 'Black Magic - Web Presenter 4K', '9190626', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB571';
    END IF;

    -- Insert Asset: BF248
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF248', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF248';
    END IF;

    -- Insert Asset: BF657
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF657', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF657';
    END IF;

    -- Insert Asset: BF491
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF491', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF491';
    END IF;

    -- Insert Asset: BF204
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BF204', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'Fujinon MS-01 Rear Zoom and Focus Lens Control Kit', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BF204';
    END IF;

    -- Insert Asset: BC623
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BC623', 'Camgear V10P AL GS Tripod System', 'Camgear V10P AL GS Tripod System', 'R1807V080173', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BC623';
    END IF;

    -- Insert Asset: BC165
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BC165', 'Camgear V15P AL MS Tripod System', 'Camgear V15P AL MS Tripod System', 'N2109V08053', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BC165';
    END IF;

    -- Insert Asset: BB841
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB841', 'Broadcast Lighting Tripod Camara Stand', 'Broadcast Lighting Tripod Camara Stand', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB841';
    END IF;

    -- Insert Asset: BB552
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB552', 'Broadcast Lighting Tripod Camara Stand', 'Broadcast Lighting Tripod Camara Stand', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB552';
    END IF;

    -- Insert Asset: BB158
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB158', 'Broadcast Lighting Tripod Camara Stand', 'Broadcast Lighting Tripod Camara Stand', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB158';
    END IF;

    -- Insert Asset: BB833
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'BSS';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB833', 'BSS - London Blue 100 Signal Proccessor', 'BSS - London Blue 100 Signal Proccessor', '11030211790', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB833';
    END IF;

    -- Insert Asset: CS993
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS993', 'Sony A7R ii Body', 'Sony A7R ii Body', '3378339', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS993';
    END IF;

    -- Insert Asset: CB210
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CB210', 'Black Magic Ursa Mini Pro G2 4K Camara', 'Black Magic Ursa Mini Pro G2 4K Camara', '9061483', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CB210';
    END IF;

    -- Insert Asset: CB783
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CB783', 'Black Magic Pocket Cinema Camera 6K with battery Pack', 'Black Magic Pocket Cinema Camera 6K with battery Pack', '9181995', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CB783';
    END IF;

    -- Insert Asset: CC373
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC373', 'Canon EOS RP Body', 'Canon EOS RP Body', '443029001278', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC373';
    END IF;

    -- Insert Asset: CC264
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC264', 'Canon - EOS R Body', 'Canon - EOS R Body', '33021004454', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC264';
    END IF;

    -- Insert Asset: CC242
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC242', 'Canon - EOS R Body', 'Canon - EOS R Body', '83023005458', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC242';
    END IF;

    -- Insert Asset: CI912
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CI912', 'Insta360', 'Insta360', 'IAHEA2505URPS7', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CI912';
    END IF;

    -- Insert Asset: CC668
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC668', 'Canon - EOS R Body', 'Canon - EOS R Body', '292028003659', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC668';
    END IF;

    -- Insert Asset: CS412
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS412', 'Staycold Fridge - Dubble Sliding Door', 'Staycold Fridge - Dubble Sliding Door', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS412';
    END IF;

    -- Insert Asset: CM163
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CM163', 'Mazzer Digital Grinder', 'Mazzer Digital Grinder', 'BREMAS', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CM163';
    END IF;

    -- Insert Asset: CC540
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC540', 'Coffee Machine Promarc Green Plus 2 Group', 'Coffee Machine Promarc Green Plus 2 Group', '10161292', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC540';
    END IF;

    -- Insert Asset: CC565
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC565', 'Coffee Machine Wega Atlas', 'Coffee Machine Wega Atlas', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC565';
    END IF;

    -- Insert Asset: CG720
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CG720', 'Grinder Santos N40 A', 'Grinder Santos N40 A', 'N365220', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CG720';
    END IF;

    -- Insert Asset: DD838
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'DLP';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DD838', 'DLP - OP0454 Projector', 'DLP - OP0454 Projector', 'FST22160106', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DD838';
    END IF;

    -- Insert Asset: DR821
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Drums';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DR821', 'Roland TD-17KVX Electronic Drumkit and MDS stand', 'Roland TD-17KVX Electronic Drumkit and MDS stand', 'E0M8027', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DR821';
    END IF;

    -- Insert Asset: EE109
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Electrosonic';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE109', 'Electrosonic - D2 Digital Receiver', 'Electrosonic - D2 Digital Receiver', '6500735', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE109';
    END IF;

    -- Insert Asset: EE480
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Electrosonic';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE480', 'Electrosonic - Dhu -470 - 607MHz Beta 87A - Mic', 'Electrosonic - Dhu -470 - 607MHz Beta 87A - Mic', '152', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE480';
    END IF;

    -- Insert Asset: EE286
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Electrosonic';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE286', 'Electrosonics ALP690 Active/Passive LPDA Antenna', 'Electrosonics ALP690 Active/Passive LPDA Antenna', '2014104', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE286';
    END IF;

    -- Insert Asset: EE474
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Electrosonic';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE474', 'Electrosonics ALP690 Active/Passive LPDA Antenna', 'Electrosonics ALP690 Active/Passive LPDA Antenna', '214935', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE474';
    END IF;

    -- Insert Asset: FF974
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Focusrite';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('FF974', 'Focusrite Scarlett18i20', 'Focusrite Scarlett18i20', 'P9DRKZ295011F2', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'FF974';
    END IF;

    -- Insert Asset: HH250
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Hollyland';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('HH250', 'Hollyland Mars 4K UHD HDMI/SDI Wireless Video Transmission System', 'Hollyland Mars 4K UHD HDMI/SDI Wireless Video Transmission System', '0023410T1207ED8', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'HH250';
    END IF;

    -- Insert Asset: HH963
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Hollyland';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('HH963', 'Hollyland Mars 4K UHD HDMI/SDI Wireless Video Transmission System', 'Hollyland Mars 4K UHD HDMI/SDI Wireless Video Transmission System', '0023430T120809C', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'HH963';
    END IF;

    -- Insert Asset: I5964
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Inverter';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('I5964', '5kva Kodac Inverter', '5kva Kodac Inverter', NULL, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'I5964';
    END IF;

    -- Insert Asset: I5156
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Inverter';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('I5156', '5kva Kodac Inverter', '5kva Kodac Inverter', NULL, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'I5156';
    END IF;

    -- Insert Asset: I5618
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Inverter';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('I5618', '5kva Kodac Inverter', '5kva Kodac Inverter', NULL, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'I5618';
    END IF;

    -- Insert Asset: I1323
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Inverter';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('I1323', '15Kva Battery', '15Kva Battery', NULL, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'I1323';
    END IF;

    -- Insert Asset: I1717
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Inverter';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('I1717', '15Kva Battery', '15Kva Battery', NULL, dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'I1717';
    END IF;

    -- Insert Asset: LL150
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'L-Acoustics';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LL150', 'L-Acoustics Amplifier Pfc4 X 1000w/8ohms. E-Networrk', 'L-Acoustics Amplifier Pfc4 X 1000w/8ohms. E-Networrk', '1180054711', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LL150';
    END IF;

    -- Insert Asset: LL338
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'L-Acoustics';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LL338', 'L-Acoustics X12 Monitor Speaker', 'L-Acoustics X12 Monitor Speaker', '1190040150', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LL338';
    END IF;

    -- Insert Asset: LL402
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'L-Acoustics';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LL402', 'L-Acoustics X12 Monitor Speaker', 'L-Acoustics X12 Monitor Speaker', '1190040166', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LL402';
    END IF;

    -- Insert Asset: LN212
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LN212', 'Novastar - VX 6S', 'Novastar - VX 6S', 'MGJC11830N0113000842', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LN212';
    END IF;

    -- Insert Asset: LI601
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LI601', 'INLED2.5-Indoor LED P2.5 7040mmx2560mm including full installation', 'INLED2.5-Indoor LED P2.5 7040mmx2560mm including full installation', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LI601';
    END IF;

    -- Insert Asset: LI245
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LI245', 'Intel 12th Gen Core i7 - CUSTOM BUILT - PC', 'Intel 12th Gen Core i7 - CUSTOM BUILT - PC', 'Custom Built', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LI245';
    END IF;

    -- Insert Asset: BB445
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB445', 'Black Magic Decklink 8K Pro', 'Black Magic Decklink 8K Pro', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB445';
    END IF;

    -- Insert Asset: LT518
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LT518', 'Tamron SP 24-70 f/2.8 DIVCUSDG2', 'Tamron SP 24-70 f/2.8 DIVCUSDG2', '21695', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LT518';
    END IF;

    -- Insert Asset: LC207
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC207', 'Canon EF 16-35mm f/2.8 USM', 'Canon EF 16-35mm f/2.8 USM', '672884', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC207';
    END IF;

    -- Insert Asset: LC200
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC200', 'Canon RF 24-105mm f/4L IS', 'Canon RF 24-105mm f/4L IS', '9312008728', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC200';
    END IF;

    -- Insert Asset: LC342
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC342', 'Canon RF 50mm F1.2 LUSM', 'Canon RF 50mm F1.2 LUSM', '2950000240', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC342';
    END IF;

    -- Insert Asset: LC161
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC161', 'Canon 70 - 200 f4 lens', 'Canon 70 - 200 f4 lens', '524000055', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC161';
    END IF;

    -- Insert Asset: LC662
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC662', 'Canon RF 85mm f/1.2 LUSM', 'Canon RF 85mm f/1.2 LUSM', '7800001855', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC662';
    END IF;

    -- Insert Asset: LS860
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS860', 'Sigma 18 - 35mm 1.8 DC', 'Sigma 18 - 35mm 1.8 DC', '56186655', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS860';
    END IF;

    -- Insert Asset: LC458
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC458', 'Canon - 50mm RF50mm F1.2 L USM', 'Canon - 50mm RF50mm F1.2 L USM', '7100001292', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC458';
    END IF;

    -- Insert Asset: LS210
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS210', 'Sigma 18 - 35mm 1.8 DC', 'Sigma 18 - 35mm 1.8 DC', '54283538', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS210';
    END IF;

    -- Insert Asset: LS524
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS524', 'Sony 70 - 200 f4 G- 0SS Lens', 'Sony 70 - 200 f4 G- 0SS Lens', '1927259', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS524';
    END IF;

    -- Insert Asset: LD424
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LD424', 'DJPower DSK 1500v LED', 'DJPower DSK 1500v LED', '201000825010092', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LD424';
    END IF;

    -- Insert Asset: LD256
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LD256', 'DJPower DSK 1500v LED', 'DJPower DSK 1500v LED', '201000825010075', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LD256';
    END IF;

    -- Insert Asset: LD720
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LD720', 'DJPower DSK 1500v LED', 'DJPower DSK 1500v LED', '201000825010082', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LD720';
    END IF;

    -- Insert Asset: LD580
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LD580', 'DJPower DSK 1500v LED', 'DJPower DSK 1500v LED', '201000825010079', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LD580';
    END IF;

    -- Insert Asset: LV249
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV249', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV249';
    END IF;

    -- Insert Asset: LA265
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LA265', 'Amarican DJ - Cannon Wash', 'Amarican DJ - Cannon Wash', '16162475', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LA265';
    END IF;

    -- Insert Asset: LE739
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE739', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE739';
    END IF;

    -- Insert Asset: LE458
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE458', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE458';
    END IF;

    -- Insert Asset: LE841
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE841', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE841';
    END IF;

    -- Insert Asset: LE163
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE163', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE163';
    END IF;

    -- Insert Asset: LE649
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE649', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE649';
    END IF;

    -- Insert Asset: LE809
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE809', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE809';
    END IF;

    -- Insert Asset: LE855
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE855', 'Elation - eSpot 3', 'Elation - eSpot 3', '16744062', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE855';
    END IF;

    -- Insert Asset: LE799
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE799', 'Elation - eSpot 3', 'Elation - eSpot 3', '172170032', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE799';
    END IF;

    -- Insert Asset: LE300
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE300', 'Elation - Fuse Wash', 'Elation - Fuse Wash', '156250217', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE300';
    END IF;

    -- Insert Asset: LE402
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE402', 'Elation - Hazer Base Pro', 'Elation - Hazer Base Pro', 'BasHz300217', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE402';
    END IF;

    -- Insert Asset: LV703
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV703', 'Versalight - LED Bar', 'Versalight - LED Bar', '18272', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV703';
    END IF;

    -- Insert Asset: LV132
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV132', 'Versalight - LED Bar', 'Versalight - LED Bar', '18269', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV132';
    END IF;

    -- Insert Asset: LV563
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV563', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV563';
    END IF;

    -- Insert Asset: LV935
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV935', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV935';
    END IF;

    -- Insert Asset: LA149
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LA149', 'Amarican DJ - Cannon Wash', 'Amarican DJ - Cannon Wash', '16162479', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LA149';
    END IF;

    -- Insert Asset: LE665
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE665', 'Elation - Dartz', 'Elation - Dartz', '192990034', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE665';
    END IF;

    -- Insert Asset: LE506
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE506', 'Elation - Dartz', 'Elation - Dartz', '170480661', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE506';
    END IF;

    -- Insert Asset: LE169
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE169', 'Elation - Dartz', 'Elation - Dartz', '192990033', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE169';
    END IF;

    -- Insert Asset: LE143
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE143', 'Elation - Dartz', 'Elation - Dartz', '178970234', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE143';
    END IF;

    -- Insert Asset: LE707
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE707', 'Elation - Dartz', 'Elation - Dartz', '197750177', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE707';
    END IF;

    -- Insert Asset: LE372
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE372', 'Elation - Dartz', 'Elation - Dartz', '197750178', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE372';
    END IF;

    -- Insert Asset: LE770
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE770', 'Elation - DTW Par 300', 'Elation - DTW Par 300', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE770';
    END IF;

    -- Insert Asset: LE699
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE699', 'Elation - Fuse Wash', 'Elation - Fuse Wash', '153910140', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE699';
    END IF;

    -- Insert Asset: LE558
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE558', 'Elation - TVL Pannel DW', 'Elation - TVL Pannel DW', '166020190', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE558';
    END IF;

    -- Insert Asset: LL389
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LL389', 'Lenovo - Touch Screen PC desktop', 'Lenovo - Touch Screen PC desktop', 'MP1FR46V', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LL389';
    END IF;

    -- Insert Asset: LM933
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM933', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316089', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM933';
    END IF;

    -- Insert Asset: LM231
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM231', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316099', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM231';
    END IF;

    -- Insert Asset: LM219
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM219', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316103', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM219';
    END IF;

    -- Insert Asset: LM883
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM883', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316116', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM883';
    END IF;

    -- Insert Asset: LM665
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM665', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316122', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM665';
    END IF;

    -- Insert Asset: LM977
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM977', 'Martin - ELP CL Profile', 'Martin - ELP CL Profile', '15300316123', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM977';
    END IF;

    -- Insert Asset: LM650
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM650', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100113', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM650';
    END IF;

    -- Insert Asset: LM520
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM520', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100114', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM520';
    END IF;

    -- Insert Asset: LM245
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM245', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100131', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM245';
    END IF;

    -- Insert Asset: LM547
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM547', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100132', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM547';
    END IF;

    -- Insert Asset: LM734
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM734', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100133', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM734';
    END IF;

    -- Insert Asset: LM851
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM851', 'Martin - MH 6 Wash - Rush', 'Martin - MH 6 Wash - Rush', '14550100134', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM851';
    END IF;

    -- Insert Asset: LV165
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV165', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV165';
    END IF;

    -- Insert Asset: LV114
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV114', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV114';
    END IF;

    -- Insert Asset: LV512
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV512', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV512';
    END IF;

    -- Insert Asset: LV304
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV304', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV304';
    END IF;

    -- Insert Asset: LV884
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV884', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV884';
    END IF;

    -- Insert Asset: LV215
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV215', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV215';
    END IF;

    -- Insert Asset: LV201
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV201', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV201';
    END IF;

    -- Insert Asset: LV688
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV688', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV688';
    END IF;

    -- Insert Asset: LV412
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV412', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV412';
    END IF;

    -- Insert Asset: LV107
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV107', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV107';
    END IF;

    -- Insert Asset: LV310
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV310', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV310';
    END IF;

    -- Insert Asset: LV874
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV874', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV874';
    END IF;

    -- Insert Asset: LV682
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV682', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV682';
    END IF;

    -- Insert Asset: LV296
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV296', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV296';
    END IF;

    -- Insert Asset: LV643
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV643', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV643';
    END IF;

    -- Insert Asset: LV201
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV201', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV201';
    END IF;

    -- Insert Asset: LV768
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV768', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV768';
    END IF;

    -- Insert Asset: LV978
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV978', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'VersLED UHP 18W x 18IN Ultra High Power RGBWAUV Light', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV978';
    END IF;

    -- Insert Asset: LV909
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV909', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV909';
    END IF;

    -- Insert Asset: LV179
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV179', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV179';
    END IF;

    -- Insert Asset: LV338
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV338', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV338';
    END IF;

    -- Insert Asset: LV944
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV944', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV944';
    END IF;

    -- Insert Asset: LV867
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV867', 'Vulcan - Kratos', 'Vulcan - Kratos', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV867';
    END IF;

    -- Insert Asset: LV169
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV169', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV169';
    END IF;

    -- Insert Asset: LV693
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV693', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV693';
    END IF;

    -- Insert Asset: LV758
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV758', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV758';
    END IF;

    -- Insert Asset: LV227
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV227', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV227';
    END IF;

    -- Insert Asset: LV664
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV664', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV664';
    END IF;

    -- Insert Asset: LV361
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV361', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV361';
    END IF;

    -- Insert Asset: LV208
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV208', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV208';
    END IF;

    -- Insert Asset: LV899
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV899', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV899';
    END IF;

    -- Insert Asset: LV882
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV882', 'Vulcan - Kratos', 'Vulcan - Kratos', 'VK-20201109-001', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV882';
    END IF;

    -- Insert Asset: LT898
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LT898', 'TL60 RGB LED Tube light 4 lights in a kit', 'TL60 RGB LED Tube light 4 lights in a kit', '22E00076724', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LT898';
    END IF;

    -- Insert Asset: LO517
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controler';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LO517', 'Onyx - NX Wing Lights controller', 'Onyx - NX Wing Lights controller', '1891800150', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LO517';
    END IF;

    -- Insert Asset: LM542
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controler';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LM542', 'Martin DMX 5.3 Splitter', 'Martin DMX 5.3 Splitter', '14640000834', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LM542';
    END IF;

    -- Insert Asset: LE291
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controller';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE291', 'Elation - OPTO Branch 4', 'Elation - OPTO Branch 4', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE291';
    END IF;

    -- Insert Asset: LL857
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controller';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LL857', 'Luminex -   Ethernet DMX8 MK', 'Luminex -   Ethernet DMX8 MK', 'LUM0372382', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LL857';
    END IF;

    -- Insert Asset: NF260
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Networking';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('NF260', 'Fortinet - Fortigate 80F', 'Fortinet - Fortigate 80F', 'FGT80FTK2308122', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'NF260';
    END IF;

    -- Insert Asset: NA116
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Networking';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('NA116', 'Aruba 2930F Networking Switch', 'Aruba 2930F Networking Switch', '246000001653A-R05', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'NA116';
    END IF;

    -- Insert Asset: PN690
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Piano';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PN690', 'Nord Stage 3 88 Hammer Action Stage Piano', 'Nord Stage 3 88 Hammer Action Stage Piano', 'SP44255', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PN690';
    END IF;

    -- Insert Asset: PY221
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Piano';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PY221', 'Yamaha Montage 8', 'Yamaha Montage 8', 'EAZZ01013', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PY221';
    END IF;

    -- Insert Asset: P8299
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('P8299', '80kVa BAU Generator', '80kVa BAU Generator', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'P8299';
    END IF;

    -- Insert Asset: PE944
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PE944', 'Epson EB-2140W 3LCD Projector', 'Epson EB-2140W 3LCD Projector', 'X3MD720093L', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PE944';
    END IF;

    -- Insert Asset: PE491
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PE491', 'Epson EB-2140W 3LCD Projector', 'Epson EB-2140W 3LCD Projector', 'X3MD720092L', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PE491';
    END IF;

    -- Insert Asset: PV566
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PV566', 'VEGA - 3 x 4 meter Front Screen', 'VEGA - 3 x 4 meter Front Screen', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PV566';
    END IF;

    -- Insert Asset: PV156
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PV156', 'VEGA - 3 x 4 meter Front Screen', 'VEGA - 3 x 4 meter Front Screen', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PV156';
    END IF;

    -- Insert Asset: QQ572
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ572', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000361', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ572';
    END IF;

    -- Insert Asset: QQ953
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ953', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000367', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ953';
    END IF;

    -- Insert Asset: QQ893
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ893', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000390', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ893';
    END IF;

    -- Insert Asset: QQ530
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ530', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000359', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ530';
    END IF;

    -- Insert Asset: QQ500
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ500', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000879', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ500';
    END IF;

    -- Insert Asset: QQ275
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ275', 'Quest - Q HPI Series Speakers', 'Quest - Q HPI Series Speakers', '00000885', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ275';
    END IF;

    -- Insert Asset: QQ391
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ391', 'Quest - Q HPI Series Sub', 'Quest - Q HPI Series Sub', 'SN00000192', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ391';
    END IF;

    -- Insert Asset: QQ418
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ418', 'Quest - Q HPI Series Sub', 'Quest - Q HPI Series Sub', 'SN00000209', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ418';
    END IF;

    -- Insert Asset: QQ764
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ764', 'Quest - Q Motion Speakers', 'Quest - Q Motion Speakers', '00000928', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ764';
    END IF;

    -- Insert Asset: QQ650
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ650', 'Quest - Q Motion Speakers', 'Quest - Q Motion Speakers', '00000980', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ650';
    END IF;

    -- Insert Asset: QQ447
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ447', 'Quest - Q Motion Speakers', 'Quest - Q Motion Speakers', '00000871', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ447';
    END IF;

    -- Insert Asset: QQ359
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ359', 'Quest - Q Motion Speakers', 'Quest - Q Motion Speakers', '00000929', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ359';
    END IF;

    -- Insert Asset: QQ604
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ604', 'Quest - QA1004 AMP', 'Quest - QA1004 AMP', '00000838', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ604';
    END IF;

    -- Insert Asset: QQ121
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ121', 'Quest - QA3004 AMP', 'Quest - QA3004 AMP', '00001586', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ121';
    END IF;

    -- Insert Asset: QQ824
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Quest';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('QQ824', 'Quest - QA3004 AMP', 'Quest - QA3004 AMP', '00001594', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'QQ824';
    END IF;

    -- Insert Asset: SS158
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS158', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS158';
    END IF;

    -- Insert Asset: SS577
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS577', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS577';
    END IF;

    -- Insert Asset: SS277
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS277', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS277';
    END IF;

    -- Insert Asset: SS593
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS593', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS593';
    END IF;

    -- Insert Asset: SS560
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS560', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS560';
    END IF;

    -- Insert Asset: SS660
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS660', 'Sennheiser MKE Microphone', 'Sennheiser MKE Microphone', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS660';
    END IF;

    -- Insert Asset: SS872
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS872', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '1149001597', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS872';
    END IF;

    -- Insert Asset: SS399
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS399', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '114001599', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS399';
    END IF;

    -- Insert Asset: SS278
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS278', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '114001600', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS278';
    END IF;

    -- Insert Asset: SS588
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS588', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '5224004603', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS588';
    END IF;

    -- Insert Asset: SS322
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS322', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '5224004604', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS322';
    END IF;

    -- Insert Asset: SS123
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS123', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz Pack', '1149001601', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS123';
    END IF;

    -- Insert Asset: SS386
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS386', 'Sennheiser EK IME G4 Reiever - 734 - 776MHz Pack', 'Sennheiser EK IME G4 Reiever - 734 - 776MHz Pack', '1110002389', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS386';
    END IF;

    -- Insert Asset: SS745
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS745', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '5474003426', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS745';
    END IF;

    -- Insert Asset: SS997
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS997', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '5224003329', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS997';
    END IF;

    -- Insert Asset: SS877
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS877', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '1169001240', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS877';
    END IF;

    -- Insert Asset: SS874
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS874', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '1169001241', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS874';
    END IF;

    -- Insert Asset: SS828
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS828', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '5224003328', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS828';
    END IF;

    -- Insert Asset: SS856
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS856', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '1169001239', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS856';
    END IF;

    -- Insert Asset: SS856
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser Pack';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS856', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', 'Sennheiser EK IEM G4 734 - 776MHz Transmitter', '5224003330', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS856';
    END IF;

    -- Insert Asset: SS461
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS461', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz', 'Sennheiser EK IME G4 Receiver - 734 - 776MHz', '1149001596', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS461';
    END IF;

    -- Insert Asset: SS422
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS422', 'Shure - BLX2 K3E - 606 - 630MHz - Beta58A Mic', 'Shure - BLX2 K3E - 606 - 630MHz - Beta58A Mic', '3QL2833768', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS422';
    END IF;

    -- Insert Asset: SS960
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS960', 'Shure - BLX2 K3E - 606 - 630MHz - Beta58A Mic', 'Shure - BLX2 K3E - 606 - 630MHz - Beta58A Mic', '173589039', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS960';
    END IF;

    -- Insert Asset: SS355
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS355', 'Shure - BLX2 Q25 - 742 - 766MHz - Mic', 'Shure - BLX2 Q25 - 742 - 766MHz - Mic', 'PB249042', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS355';
    END IF;

    -- Insert Asset: SS973
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS973', 'Shure - PSM300 Transmitter P3T Q25 742 - 766MHz', 'Shure - PSM300 Transmitter P3T Q25 742 - 766MHz', '3SJ28517527', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS973';
    END IF;

    -- Insert Asset: SS804
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS804', 'Shure - QLXD2 J50A - 572 - 615MHz - KSM8 Mic', 'Shure - QLXD2 J50A - 572 - 615MHz - KSM8 Mic', '2217838441', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS804';
    END IF;

    -- Insert Asset: SS339
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS339', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS339';
    END IF;

    -- Insert Asset: SS967
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS967', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', '3PE2376768', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS967';
    END IF;

    -- Insert Asset: SS809
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS809', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', 'Shure - SLX2 - 572 - 596MHz - Beta58A Mic', '80106128305', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS809';
    END IF;

    -- Insert Asset: SS930
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS930', 'Shure - SLX2 - 572 - 596MHz - Beta87A', 'Shure - SLX2 - 572 - 596MHz - Beta87A', '102707146201', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS930';
    END IF;

    -- Insert Asset: SS981
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS981', 'Shure - SLX2 - 638 - 662MHz - Beta58A Mic', 'Shure - SLX2 - 638 - 662MHz - Beta58A Mic', '3PH3064123', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS981';
    END IF;

    -- Insert Asset: SS103
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS103', 'Shure - SLX4 Receiver - 572 -596MHz', 'Shure - SLX4 Receiver - 572 -596MHz', '3QA2257560', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS103';
    END IF;

    -- Insert Asset: SS436
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS436', 'Shure - SLX4 Receiver - 638 -662MHz', 'Shure - SLX4 Receiver - 638 -662MHz', '1M12561947-01', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS436';
    END IF;

    -- Insert Asset: SS281
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS281', 'Shure - ULXD2 606 - 670MHz - Beta87A Mic', 'Shure - ULXD2 606 - 670MHz - Beta87A Mic', '3CH03559366', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS281';
    END IF;

    -- Insert Asset: SS500
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS500', 'Shure - ULXD2 R51 - 800 - 810MHz - Beta87A Mic', 'Shure - ULXD2 R51 - 800 - 810MHz - Beta87A Mic', '18165323023', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS500';
    END IF;

    -- Insert Asset: SS323
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS323', 'Shure BLX4 Q25 Receiver', 'Shure BLX4 Q25 Receiver', '3PB293446301', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS323';
    END IF;

    -- Insert Asset: SS940
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS940', 'Shure K61 - ULXD4 606 - 670MHz Receiver', 'Shure K61 - ULXD4 606 - 670MHz Receiver', '3AG21043235', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS940';
    END IF;

    -- Insert Asset: SS552
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS552', 'Shure ULXD1 R51 800 - 810MHz Body Pack', 'Shure ULXD1 R51 800 - 810MHz Body Pack', '2RF1312299', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS552';
    END IF;

    -- Insert Asset: SS966
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS966', 'Shure - ULXD 800 - 810 MHz Receiver', 'Shure - ULXD 800 - 810 MHz Receiver', '2NI1258159-01', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS966';
    END IF;

    -- Insert Asset: SS746
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS746', 'Shure - SLX4 - 572 - 596MHz Receiver', 'Shure - SLX4 - 572 - 596MHz Receiver', '1IC119076-05', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS746';
    END IF;

    -- Insert Asset: SS394
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS394', 'Shure -BLX4R - 606 - 630MHz Receiver', 'Shure -BLX4R - 606 - 630MHz Receiver', '3RA2436140', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS394';
    END IF;

    -- Insert Asset: SS951
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS951', 'Shure -BLX4R - 606 - 630MHz Receiver', 'Shure -BLX4R - 606 - 630MHz Receiver', '3QL2833772', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS951';
    END IF;

    -- Insert Asset: SS302
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS302', 'Shure - SLX4 - 572 - 596MHz  Receiver', 'Shure - SLX4 - 572 - 596MHz  Receiver', '1H2887412-05', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS302';
    END IF;

    -- Insert Asset: SS324
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS324', 'Shure - SLX4 - 572 - 596MHz Receiver', 'Shure - SLX4 - 572 - 596MHz Receiver', '3SK19751292', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS324';
    END IF;

    -- Insert Asset: SS529
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS529', 'Shure - SLX4 - 638 -662MHz Receiver', 'Shure - SLX4 - 638 -662MHz Receiver', '1MI2561895-02', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS529';
    END IF;

    -- Insert Asset: SS303
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS303', 'Shure - QLXD4 - 572 - 616MHz Receiver', 'Shure - QLXD4 - 572 - 616MHz Receiver', '2BF01894582', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS303';
    END IF;

    -- Insert Asset: SS268
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sound';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS268', 'Sennheiser SK 100 G3 780 - 822MHz Transmitter', 'Sennheiser SK 100 G3 780 - 822MHz Transmitter', '1238364992', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS268';
    END IF;

    -- Insert Asset: SS796
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sound';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS796', 'Sennheiser SK 100 G3 780 - 822MHz Receiver', 'Sennheiser SK 100 G3 780 - 822MHz Receiver', '1258273610', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS796';
    END IF;

    -- Insert Asset: SD341
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sound Desk';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SD341', 'Digico - D Rack', 'Digico - D Rack', 'AW-295-00012-11-1', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SD341';
    END IF;

    -- Insert Asset: SD748
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sound Desk';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SD748', 'Digico -Sound Desk S21', 'Digico -Sound Desk S21', '2120831803', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SD748';
    END IF;

    -- Insert Asset: TS898
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS898', 'Samsung - 55inch', 'Samsung - 55inch', '0B7B39NFB01089Z', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS898';
    END IF;

    -- Insert Asset: TH852
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH852', 'Hisence - 49 Inch', 'Hisence - 49 Inch', '3TE49M1751220-1F1LA51538', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH852';
    END IF;

    -- Insert Asset: TH238
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH238', 'Hisence - 49 Inch', 'Hisence - 49 Inch', '3TE49M1735350-1G6LA50665', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH238';
    END IF;

    -- Insert Asset: TH706
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH706', 'Hisence - 58inch', 'Hisence - 58inch', '3TE58F23020Y0-1A2GSJ1133', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH706';
    END IF;

    -- Insert Asset: TH756
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH756', 'Hisense 65 Inch', 'Hisense 65 Inch', '3TE65T1936100-1EF6SJ0176', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH756';
    END IF;

    -- Insert Asset: TH113
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH113', 'Hisense 65 Inch', 'Hisense 65 Inch', '3TE65T1936100-1EF6SJ0247', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH113';
    END IF;

    -- Insert Asset: TH509
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH509', 'Hisense 65 Inch', 'Hisense 65 Inch', '3TE65T1936100-1EF6SJ0179', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH509';
    END IF;

    -- Insert Asset: TH611
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH611', 'Hisense 65 Inch', 'Hisense 65 Inch', '3TE65T1936100-1EF6SJ0180', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH611';
    END IF;

    -- Insert Asset: TL260
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TL260', 'LG - 55 Inch', 'LG - 55 Inch', '001SAVY07679', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TL260';
    END IF;

    -- Insert Asset: TS539
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS539', 'Samsung 46 Inch', 'Samsung 46 Inch', '258238RC100120V', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS539';
    END IF;

    -- Insert Asset: TS122
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'TV''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS122', 'SKYE HD 86" interactive 4k Touch Panel including camera, screen share dongle, wall bracket and i7 Windows PC', 'SKYE HD 86" interactive 4k Touch Panel including camera, screen share dongle, wall bracket and i7 Windows PC', 'J88C2502169021700044', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS122';
    END IF;

    -- Insert Asset: CC960
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC960', 'Canon EOS RP Body only', 'Canon EOS RP Body only', '4549292132151', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC960';
    END IF;

    -- Insert Asset: BM368
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Centurion';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BM368', 'Motorized Video Slider (1.2m)', 'Motorized Video Slider (1.2m)', 'BCH107270', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BM368';
    END IF;

    -- Insert Asset: AJ696
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ696', 'JetAir 18000BTU Undercelling', 'JetAir 18000BTU Undercelling', '4M70590001050', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ696';
    END IF;

    -- Insert Asset: AJ137
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ137', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00050', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ137';
    END IF;

    -- Insert Asset: AJ567
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ567', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00031', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ567';
    END IF;

    -- Insert Asset: AJ305
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ305', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00045', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ305';
    END IF;

    -- Insert Asset: AJ368
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ368', 'JetAir 12000BTU Underceilling', 'JetAir 12000BTU Underceilling', 'B33948659902N00268', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ368';
    END IF;

    -- Insert Asset: AJ855
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ855', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00000', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ855';
    END IF;

    -- Insert Asset: AJ482
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ482', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00000', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ482';
    END IF;

    -- Insert Asset: AJ751
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ751', 'JetAir 60000BTU Undercelling', 'JetAir 60000BTU Undercelling', 'WNE549139002N00000', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ751';
    END IF;

    -- Insert Asset: AJ489
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ489', 'JetAir12000BTU Underceiling', 'JetAir12000BTU Underceiling', 'B4015C308508N00819', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ489';
    END IF;

    -- Insert Asset: AJ543
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ543', 'JetAir12000BTU Underceiling', 'JetAir12000BTU Underceiling', 'B4015C271609N01301', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ543';
    END IF;

    -- Insert Asset: AJ235
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ235', 'JetAir12000BTU Underceiling', 'JetAir12000BTU Underceiling', 'B33948480801N00716', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ235';
    END IF;

    -- Insert Asset: AJ754
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AJ754', 'JetAir12000BTU Underceiling', 'JetAir12000BTU Underceiling', 'B33948480801N00716', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AJ754';
    END IF;

    -- Insert Asset: AA100
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA100', 'Apple - Ipad Air', 'Apple - Ipad Air', 'DMPM4L8VFK11', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA100';
    END IF;

    -- Insert Asset: AA642
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA642', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'LDX0YKJGWY', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA642';
    END IF;

    -- Insert Asset: AA185
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA185', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'HNGJFK09QQ', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA185';
    END IF;

    -- Insert Asset: AA754
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA754', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'JGNW3RKVKT', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA754';
    END IF;

    -- Insert Asset: AA329
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA329', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'HN7NCMHH73', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA329';
    END IF;

    -- Insert Asset: AA753
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA753', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'JWLX4N3F2R', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA753';
    END IF;

    -- Insert Asset: AA319
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA319', 'Apple - Ipad 10th Gen', 'Apple - Ipad 10th Gen', 'C9P2F5992P', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA319';
    END IF;

    -- Insert Asset: AA592
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA592', 'Apple - Mac Mini M1 2020', 'Apple - Mac Mini M1 2020', 'C07FD2HWQ6P0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA592';
    END IF;

    -- Insert Asset: AA712
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA712', 'Apple - Mac Mini M1 2020', 'Apple - Mac Mini M1 2020', 'C07FD2HXQ6P0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA712';
    END IF;

    -- Insert Asset: AA820
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA820', 'Apple - Macbook Air M1 2020', 'Apple - Macbook Air M1 2020', 'HXJQ1ABG1WFV', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA820';
    END IF;

    -- Insert Asset: AA225
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA225', 'Apple - Macbook Air M1 2020', 'Apple - Macbook Air M1 2020', 'C02F89J3Q6L5', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA225';
    END IF;

    -- Insert Asset: AM332
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AM332', 'Macbook Pro', 'Macbook Pro', 'C02TM240FVH3', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AM332';
    END IF;

    -- Insert Asset: AA580
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA580', 'Apple - Imac 27inc 2015', 'Apple - Imac 27inc 2015', 'C02ST5ZDGG7J', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA580';
    END IF;

    -- Insert Asset: BB625
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB625', 'Blackmagic - Web Presenter 4K', 'Blackmagic - Web Presenter 4K', '9190519', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB625';
    END IF;

    -- Insert Asset: BB530
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB530', 'Blackmagic - HyperDeck Studio Mini', 'Blackmagic - HyperDeck Studio Mini', '5173610', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB530';
    END IF;

    -- Insert Asset: BB480
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB480', 'BlackMagic - Television Studio HD', 'BlackMagic - Television Studio HD', '5836084', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB480';
    END IF;

    -- Insert Asset: BB851
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BB851', 'BlackMagic - Television Studio Pro 4K', 'BlackMagic - Television Studio Pro 4K', '8997453', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BB851';
    END IF;

    -- Insert Asset: BS724
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BS724', 'Swift 800 Video Transmitter systems', 'Swift 800 Video Transmitter systems', 'WSCJ120285', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BS724';
    END IF;

    -- Insert Asset: BH814
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BH814', 'Hollyland - Cosmo 600 Transmitter', 'Hollyland - Cosmo 600 Transmitter', 'T18150162', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BH814';
    END IF;

    -- Insert Asset: BA271
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA271', 'Arklite Tripod system', 'Arklite Tripod system', 'N2109V08057', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA271';
    END IF;

    -- Insert Asset: BA701
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA701', 'Arklite Tripod system', 'Arklite Tripod system', 'N2109V08062', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA701';
    END IF;

    -- Insert Asset: BA673
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA673', 'Arklite Tripod system', 'Arklite Tripod system', 'N2109V08068', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA673';
    END IF;

    -- Insert Asset: BA696
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA696', 'Arklite Tripod system', 'Arklite Tripod system', 'N2109V08058', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA696';
    END IF;

    -- Insert Asset: BH725
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BH725', 'Hollyland - Cosmo 600 Transmitter', 'Hollyland - Cosmo 600 Transmitter', 'R-1815015E', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BH725';
    END IF;

    -- Insert Asset: CC169
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CC169', 'Canon - EOS RP Body', 'Canon - EOS RP Body', '242026004513', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CC169';
    END IF;

    -- Insert Asset: CS540
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS540', 'Sony PXW-FS5K XDCAM Super', 'Sony PXW-FS5K XDCAM Super', '4003497', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS540';
    END IF;

    -- Insert Asset: CS348
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS348', 'Sony PXW-FS5K XDCAM Super', 'Sony PXW-FS5K XDCAM Super', '4003500', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS348';
    END IF;

    -- Insert Asset: CS759
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS759', 'Sony PXW-FS5K XDCAM Super', 'Sony PXW-FS5K XDCAM Super', '4001465', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS759';
    END IF;

    -- Insert Asset: CS566
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS566', 'Sony PXW-FS5K XDCAM Super', 'Sony PXW-FS5K XDCAM Super', '4000925', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS566';
    END IF;

    -- Insert Asset: CS735
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS735', 'Sony PXW-FS5K XDCAM Super', 'Sony PXW-FS5K XDCAM Super', '4000564', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS735';
    END IF;

    -- Insert Asset: CS204
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Camara';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CS204', 'Sony Alpha A7R III Mirrorless Digital Camera', 'Sony Alpha A7R III Mirrorless Digital Camera', '4484858', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CS204';
    END IF;

    -- Insert Asset: CO323
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CO323', 'Omega Refrigeration - Fridge Sliding Door Fridge', 'Omega Refrigeration - Fridge Sliding Door Fridge', '1140GACHELF12180055', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CO323';
    END IF;

    -- Insert Asset: CL702
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Coffee Station';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('CL702', 'LaZpaziale - Via E Duse 8 Coffee Machine', 'LaZpaziale - Via E Duse 8 Coffee Machine', '1034037', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'CL702';
    END IF;

    -- Insert Asset: DD569
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Digico';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DD569', 'Digico Sound Desk S21', 'Digico Sound Desk S21', '2115091808', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DD569';
    END IF;

    -- Insert Asset: DD655
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Digico';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DD655', 'D Rack - 32 Imput - 16 Output', 'D Rack - 32 Imput - 16 Output', '1910311804', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DD655';
    END IF;

    -- Insert Asset: DD962
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Drums';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DD962', 'Drum Kit Yamaha Oak Custom 5ps DWCP3000', 'Drum Kit Yamaha Oak Custom 5ps DWCP3000', '47139211916', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DD962';
    END IF;

    -- Insert Asset: DL159
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Drums';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('DL159', 'Lewitt Drum Mics', 'Lewitt Drum Mics', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'DL159';
    END IF;

    -- Insert Asset: EE873
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE873', 'EAW - RSX89 Speaker', 'EAW - RSX89 Speaker', '204753690BRLG0048', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE873';
    END IF;

    -- Insert Asset: EE483
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE483', 'EAW - RSX89 Speaker', 'EAW - RSX89 Speaker', '204753690BRLJ0014', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE483';
    END IF;

    -- Insert Asset: EE162
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE162', 'EAW - Redline Speaker', 'EAW - Redline Speaker', '204530290BRH00078', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE162';
    END IF;

    -- Insert Asset: EE882
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE882', 'EAW - Redline Speaker', 'EAW - Redline Speaker', '204530290BRH00077', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE882';
    END IF;

    -- Insert Asset: EE291
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE291', 'EAW - RSX129 Speaker', 'EAW - RSX129 Speaker', '204756490BRLJ0036', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE291';
    END IF;

    -- Insert Asset: EE149
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE149', 'EAW - RSX129 Speaker', 'EAW - RSX129 Speaker', '204756490BRLJ0004', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE149';
    END IF;

    -- Insert Asset: EE703
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE703', 'EAW - Redline Speaker', 'EAW - Redline Speaker', '204530290BRIE0023', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE703';
    END IF;

    -- Insert Asset: EE867
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE867', 'EAW - Redline Speaker', 'EAW - Redline Speaker', '204530290BRIE0026', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE867';
    END IF;

    -- Insert Asset: EE811
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE811', 'EAW Redline RL18s Single 18" High Output Subwoofer', 'EAW Redline RL18s Single 18" High Output Subwoofer', '204561580BRIE0096', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE811';
    END IF;

    -- Insert Asset: EE894
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE894', 'EAW Redline RL18s Single 18" High Output Subwoofer', 'EAW Redline RL18s Single 18" High Output Subwoofer', '20456158BRIE0089', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE894';
    END IF;

    -- Insert Asset: EE654
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE654', 'EAW - RSX89 Speaker', 'EAW - RSX89 Speaker', '204753690BRLJ0008', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE654';
    END IF;

    -- Insert Asset: EE979
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'EAW';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('EE979', 'EAW - RSX89 Speaker', 'EAW - RSX89 Speaker', '204753690BRLI0017', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'EE979';
    END IF;

    -- Insert Asset: FF518
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Focus right';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('FF518', 'Focus Right- Scarlet 18i20', 'Focus Right- Scarlet 18i20', 'P9HQ86795011F4', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'FF518';
    END IF;

    -- Insert Asset: HH329
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Hollyland';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('HH329', 'Hollyland - Cosmo C1 Transmitter', 'Hollyland - Cosmo C1 Transmitter', '002209T I00241D', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'HH329';
    END IF;

    -- Insert Asset: HH822
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Hollyland';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('HH822', 'Hollyland - Cosmo C1 Receiver', 'Hollyland - Cosmo C1 Receiver', '002209R10024E0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'HH822';
    END IF;

    -- Insert Asset: LN551
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LN551', 'Novastar - VX600', 'Novastar - VX600', '24702A000001446', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LN551';
    END IF;

    -- Insert Asset: L3918
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('L3918', '3TB - 64gb - 12th Gen Intel i7-12700K Custom Built Pc', '3TB - 64gb - 12th Gen Intel i7-12700K Custom Built Pc', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'L3918';
    END IF;

    -- Insert Asset: LC217
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC217', 'Canon RF 16mm 1.8f', 'Canon RF 16mm 1.8f', '1812003652', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC217';
    END IF;

    -- Insert Asset: LC427
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC427', 'Canon EF 70 - 200mm 2.8f', 'Canon EF 70 - 200mm 2.8f', '1012007259', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC427';
    END IF;

    -- Insert Asset: LC599
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC599', 'Canon RF 50mm 1.8f STM', 'Canon RF 50mm 1.8f STM', '5221002838', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC599';
    END IF;

    -- Insert Asset: LS259
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS259', 'Sony - 18-105mm 4f lens', 'Sony - 18-105mm 4f lens', '2130591', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS259';
    END IF;

    -- Insert Asset: LS699
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS699', 'Sony FE - 70-200mm 4f lens', 'Sony FE - 70-200mm 4f lens', '1923650', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS699';
    END IF;

    -- Insert Asset: LS228
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS228', 'Sony - 18-105mm 4f lens', 'Sony - 18-105mm 4f lens', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS228';
    END IF;

    -- Insert Asset: LS416
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS416', 'Sony - 18-105mm 4f lens', 'Sony - 18-105mm 4f lens', '2131448', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS416';
    END IF;

    -- Insert Asset: LS389
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS389', 'Sony - 18-105mm 4f lens', 'Sony - 18-105mm 4f lens', '2149008', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS389';
    END IF;

    -- Insert Asset: LS102
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS102', 'Sony FE - 70-200mm 4f lens', 'Sony FE - 70-200mm 4f lens', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS102';
    END IF;

    -- Insert Asset: LS327
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LS327', 'Sony - 18-105mm 4f lens', 'Sony - 18-105mm 4f lens', '2195535', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LS327';
    END IF;

    -- Insert Asset: LT350
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lens';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LT350', 'Tamron 28 - 75mm lens', 'Tamron 28 - 75mm lens', '068187', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LT350';
    END IF;

    -- Insert Asset: LE143
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE143', 'Elation - Dartz 360', 'Elation - Dartz 360', '192990060', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE143';
    END IF;

    -- Insert Asset: LE258
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE258', 'Elation - Dartz 360', 'Elation - Dartz 360', '171480026', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE258';
    END IF;

    -- Insert Asset: LE967
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE967', 'Elation - Dartz 360', 'Elation - Dartz 360', '234500066', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE967';
    END IF;

    -- Insert Asset: LE410
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE410', 'Elation - Dartz 360', 'Elation - Dartz 360', '239490266', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE410';
    END IF;

    -- Insert Asset: LE419
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE419', 'Elation - Dartz 360', 'Elation - Dartz 360', '234070045', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE419';
    END IF;

    -- Insert Asset: LE325
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE325', 'Elation - Dartz 360', 'Elation - Dartz 360', '234500065', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE325';
    END IF;

    -- Insert Asset: LE718
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE718', 'Elation - ENODE 4', 'Elation - ENODE 4', '180930221', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE718';
    END IF;

    -- Insert Asset: LH825
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LH825', 'Hazer Base Pro', 'Hazer Base Pro', 'BASHZ023919', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LH825';
    END IF;

    -- Insert Asset: LE348
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE348', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710276', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE348';
    END IF;

    -- Insert Asset: LE960
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE960', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710277', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE960';
    END IF;

    -- Insert Asset: LE704
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE704', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710275', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE704';
    END IF;

    -- Insert Asset: LE833
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE833', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710400', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE833';
    END IF;

    -- Insert Asset: LE114
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE114', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710278', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE114';
    END IF;

    -- Insert Asset: LE537
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE537', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710261', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE537';
    END IF;

    -- Insert Asset: LE362
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE362', 'Elation KL4 Fresnel', 'Elation KL4 Fresnel', '190710367', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE362';
    END IF;

    -- Insert Asset: LV161
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV161', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV161';
    END IF;

    -- Insert Asset: LV434
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV434', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV434';
    END IF;

    -- Insert Asset: LV119
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV119', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV119';
    END IF;

    -- Insert Asset: LV771
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV771', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV771';
    END IF;

    -- Insert Asset: LV445
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV445', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV445';
    END IF;

    -- Insert Asset: LV282
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV282', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV282';
    END IF;

    -- Insert Asset: LV243
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV243', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV243';
    END IF;

    -- Insert Asset: LV904
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV904', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV904';
    END IF;

    -- Insert Asset: LV865
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV865', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV865';
    END IF;

    -- Insert Asset: LV346
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV346', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV346';
    END IF;

    -- Insert Asset: LV643
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV643', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV643';
    END IF;

    -- Insert Asset: LV711
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV711', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV711';
    END IF;

    -- Insert Asset: LV786
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV786', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV786';
    END IF;

    -- Insert Asset: LV130
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LV130', 'Vulcan-Kratos', 'Vulcan-Kratos', 'VK190400127', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LV130';
    END IF;

    -- Insert Asset: LE775
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LE775', 'Elation - DW Fresnel', 'Elation - DW Fresnel', '138940004', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LE775';
    END IF;

    -- Insert Asset: LC538
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controller';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LC538', 'Chamsys PC Wing Compact', 'Chamsys PC Wing Compact', 'CH31929196183', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LC538';
    END IF;

    -- Insert Asset: LI308
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controller';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LI308', 'Iiyama Pro Lite T2236MSC', 'Iiyama Pro Lite T2236MSC', '11402A9301083', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LI308';
    END IF;

    -- Insert Asset: LI381
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lights Controller';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LI381', 'Intel i3 250gb Iris Plus Graphics PC', 'Intel i3 250gb Iris Plus Graphics PC', 'NUC8i3BEH', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LI381';
    END IF;

    -- Insert Asset: PY345
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Piano';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PY345', 'Yamaha Montage 8', 'Yamaha Montage 8', 'EAWN01058', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PY345';
    END IF;

    -- Insert Asset: PR174
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PR174', 'Revov Batteries R100 5kva', 'Revov Batteries R100 5kva', 'ES20220827#30R305', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PR174';
    END IF;

    -- Insert Asset: PR962
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PR962', 'Revov Batteries R100 5kva', 'Revov Batteries R100 5kva', 'ES20220827#30R306', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PR962';
    END IF;

    -- Insert Asset: PR920
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PR920', 'Revov Batteries R100 5kva', 'Revov Batteries R100 5kva', 'ES20220827#30R307', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PR920';
    END IF;

    -- Insert Asset: PR384
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PR384', 'Revov Batteries R100 5kva', 'Revov Batteries R100 5kva', 'ES20220827#30R308', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PR384';
    END IF;

    -- Insert Asset: PR142
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PR142', 'Revov Batteries R100 5kva', 'Revov Batteries R100 5kva', 'ES20220827#30R309', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PR142';
    END IF;

    -- Insert Asset: PS481
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PS481', 'SunSynk - 12k-SG04LP3', 'SunSynk - 12k-SG04LP3', '2404076380', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PS481';
    END IF;

    -- Insert Asset: PS684
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PS684', 'SunSynk - 12k-SG04LP3', 'SunSynk - 12k-SG04LP3', '2404076400', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PS684';
    END IF;

    -- Insert Asset: P1951
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('P1951', '100kVa BAU Generator', '100kVa BAU Generator', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'P1951';
    END IF;

    -- Insert Asset: PE826
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Printer';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PE826', 'Epson Printer L6270', 'Epson Printer L6270', 'G13402X28050', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PE826';
    END IF;

    -- Insert Asset: PE514
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PE514', 'Epson EB-2250U', 'Epson EB-2250U', 'X3NN810011L', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PE514';
    END IF;

    -- Insert Asset: PP982
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PP982', 'Projector JK 1500-1.2M Screen', 'Projector JK 1500-1.2M Screen', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PP982';
    END IF;

    -- Insert Asset: SS823
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS823', 'Sennheiser - EK IEM G4 734 776MHz Receiver', 'Sennheiser - EK IEM G4 734 776MHz Receiver', '11390001518', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS823';
    END IF;

    -- Insert Asset: SS378
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS378', 'Sennheiser - EK IEM G4 734 776MHz Receiver', 'Sennheiser - EK IEM G4 734 776MHz Receiver', '1149001588', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS378';
    END IF;

    -- Insert Asset: SS489
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS489', 'Sennheiser - EK IEM G4 734 776MHz Receiver', 'Sennheiser - EK IEM G4 734 776MHz Receiver', '1149001594', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS489';
    END IF;

    -- Insert Asset: SS729
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS729', 'Sennheiser - EK IEM G4 734 776MHz Receiver', 'Sennheiser - EK IEM G4 734 776MHz Receiver', '1149001595', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS729';
    END IF;

    -- Insert Asset: SS197
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS197', 'Sennheiser - EK IEM G4 734 776MHz Receiver', 'Sennheiser - EK IEM G4 734 776MHz Receiver', '1139001531', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS197';
    END IF;

    -- Insert Asset: SS368
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS368', 'Sennheiser SR IEM G4 734-776MHZ Transmitter', 'Sennheiser SR IEM G4 734-776MHZ Transmitter', '1169001216', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS368';
    END IF;

    -- Insert Asset: SS692
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sennheiser';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS692', 'Sennheiser SR IEM G4 734-776MHZ Transmitter', 'Sennheiser SR IEM G4 734-776MHZ Transmitter', '1139001100', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS692';
    END IF;

    -- Insert Asset: SS711
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS711', 'Shure - Antenna UA844 Distribution with 2 paddels', 'Shure - Antenna UA844 Distribution with 2 paddels', '10103662577', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS711';
    END IF;

    -- Insert Asset: SS940
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS940', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', '3AG21043160', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS940';
    END IF;

    -- Insert Asset: SS923
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS923', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', '2SA0452741', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS923';
    END IF;

    -- Insert Asset: SS497
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS497', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', 'Shure-ULXD4 K51606 - 670 MHZ Receiver', '3AK19600456', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS497';
    END IF;

    -- Insert Asset: SS522
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS522', 'Shure- SLX4 638-662 MHZ Receiver', 'Shure- SLX4 638-662 MHZ Receiver', '0907071410-0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS522';
    END IF;

    -- Insert Asset: SS430
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS430', 'Shure - SLX2 L4 638 - 662MHz Beta 87 Mic', 'Shure - SLX2 L4 638 - 662MHz Beta 87 Mic', '3QD1236057', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS430';
    END IF;

    -- Insert Asset: SS355
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS355', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', '3CH04735107', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS355';
    END IF;

    -- Insert Asset: SS728
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS728', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', '3CH04735028', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS728';
    END IF;

    -- Insert Asset: SS387
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS387', 'Shure - BLX2 Q25 742 - 766MHz SM58 Mic', 'Shure - BLX2 Q25 742 - 766MHz SM58 Mic', '3RF1265868', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS387';
    END IF;

    -- Insert Asset: SS293
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS293', 'Shure - BLX2 Q25 606 - 630MHz SM58 Mic', 'Shure - BLX2 Q25 606 - 630MHz SM58 Mic', '3QL2833772', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS293';
    END IF;

    -- Insert Asset: SS135
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS135', 'Shure - SLX2 H6 518 - 542MHz Beta SM58 Mic', 'Shure - SLX2 H6 518 - 542MHz Beta SM58 Mic', '3RH0298296', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS135';
    END IF;

    -- Insert Asset: SS902
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS902', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', 'Shure -ULXD2 K51 606 - 670 MHz Beta 87 Mic', '2TA31008870', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS902';
    END IF;

    -- Insert Asset: SS683
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS683', 'Shure - BLX2 K3E 606 - 630MHz SM58 Mic', 'Shure - BLX2 K3E 606 - 630MHz SM58 Mic', '3RG0676109', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS683';
    END IF;

    -- Insert Asset: SS408
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS408', 'Shure - BLX2 K3E 606 - 630MHz SM58 Mic', 'Shure - BLX2 K3E 606 - 630MHz SM58 Mic', '3RA2435140', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS408';
    END IF;

    -- Insert Asset: SS929
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS929', 'Shure - BLX4R K3E 606 - 630MHz Receiver', 'Shure - BLX4R K3E 606 - 630MHz Receiver', '3QL2833768', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS929';
    END IF;

    -- Insert Asset: SS337
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS337', 'Shure - BLX4R K3E 606 - 630MHz Receiver', 'Shure - BLX4R K3E 606 - 630MHz Receiver', '3RGO676109', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS337';
    END IF;

    -- Insert Asset: SS595
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS595', 'Shure- SLX4 H5 518-542MHZ Receiver', 'Shure- SLX4 H5 518-542MHZ Receiver', '1005060809-05', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS595';
    END IF;

    -- Insert Asset: SS903
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS903', 'Shure - BLX4R K3E 606 - 630MHz Receiver', 'Shure - BLX4R K3E 606 - 630MHz Receiver', '3QL2833773', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS903';
    END IF;

    -- Insert Asset: SS264
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS264', 'Shure - BLX4R Q25 742 - 766MHz Receiver', 'Shure - BLX4R Q25 742 - 766MHz Receiver', '3RF2832921', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS264';
    END IF;

    -- Insert Asset: SP619
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Speakers';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SP619', 'Power Works - Jupiter 15A DSP', 'Power Works - Jupiter 15A DSP', '806233300139', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SP619';
    END IF;

    -- Insert Asset: SP895
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Speakers';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SP895', 'Power Works - Jupiter 15A DSP', 'Power Works - Jupiter 15A DSP', '806233300104', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SP895';
    END IF;

    -- Insert Asset: TS960
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS960', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-T005563', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS960';
    END IF;

    -- Insert Asset: TS845
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS845', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-S227165', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS845';
    END IF;

    -- Insert Asset: TH748
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH748', 'Hisence - 55Inc', 'Hisence - 55Inc', '3TE55F19050201E3FSJ0205', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH748';
    END IF;

    -- Insert Asset: TS636
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS636', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-T005186', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS636';
    END IF;

    -- Insert Asset: TS377
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS377', 'Sinotec - 65U20UM', 'Sinotec - 65U20UM', 'MO-U302977', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS377';
    END IF;

    -- Insert Asset: TH156
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH156', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE65F1711150-1GCGSJ0184', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH156';
    END IF;

    -- Insert Asset: TS263
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS263', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-T005397', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS263';
    END IF;

    -- Insert Asset: TS540
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS540', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-S226722', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS540';
    END IF;

    -- Insert Asset: TH443
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH443', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE55F18380301FFWSJ0223', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH443';
    END IF;

    -- Insert Asset: TH789
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH789', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE55F18452201EANSJ0521', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH789';
    END IF;

    -- Insert Asset: TH748
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH748', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE55F18452201EANSJ0519', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH748';
    END IF;

    -- Insert Asset: TH738
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH738', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE55F18452201EANSJ0517', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH738';
    END IF;

    -- Insert Asset: TS437
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS437', 'Sinotec - 65U2M', 'Sinotec - 65U2M', 'MO-T005553', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS437';
    END IF;

    -- Insert Asset: TH405
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH405', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE65F17111501GCGSJ0184', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH405';
    END IF;

    -- Insert Asset: TH101
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TH101', 'Hisense - 65Inc', 'Hisense - 65Inc', '3TE75F18491601E39SJ0141', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TH101';
    END IF;

    -- Insert Asset: L2225
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Krugersdorp';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'LED';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('L2225', '2.5-Indoor Module LED P2.5 320mm x 160mm including full installation', '2.5-Indoor Module LED P2.5 320mm x 160mm including full installation', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'L2225';
    END IF;

    -- Insert Asset: AB414
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Aircon';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AB414', 'Black JetAir - 24000BTU', 'Black JetAir - 24000BTU', 'B3938A789402N00013', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AB414';
    END IF;

    -- Insert Asset: AA586
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA586', 'Apple - Home Pod', 'Apple - Home Pod', 'DQTVV25Z265', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA586';
    END IF;

    -- Insert Asset: A1737
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('A1737', '11-inch iPad Pro (3rd generation)', '11-inch iPad Pro (3rd generation)', 'NXKQK56FNQ', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'A1737';
    END IF;

    -- Insert Asset: AA554
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA554', 'Apple - Home Pod Speaker', 'Apple - Home Pod Speaker', 'CC4W43F6J265', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA554';
    END IF;

    -- Insert Asset: AA218
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA218', 'Apple - Ipad Mini', 'Apple - Ipad Mini', 'H64GF7HJM3', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA218';
    END IF;

    -- Insert Asset: AA487
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA487', 'Apple - Macbook Pro 16-inch 2023', 'Apple - Macbook Pro 16-inch 2023', 'CKQ95QX0W5', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA487';
    END IF;

    -- Insert Asset: AA998
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA998', 'Apple - Ipad Pro', 'Apple - Ipad Pro', 'F6XLD0XQNK', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA998';
    END IF;

    -- Insert Asset: AA135
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('AA135', 'Apple - iMac 27" 5K Retina 3.8GHz 8C i7 10th Generation 512GB', 'Apple - iMac 27" 5K Retina 3.8GHz 8C i7 10th Generation 512GB', 'C02DR0FZPN5W', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'AA135';
    END IF;

    -- Insert Asset: A1264
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('A1264', '13.3-inch MacBook Air (M1, 2020)', '13.3-inch MacBook Air (M1, 2020)', 'HXJN86AV1WFV', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'A1264';
    END IF;

    -- Insert Asset: A1912
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Apple';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('A1912', '13.3-inch MacBook Air (M1, 2020)', '13.3-inch MacBook Air (M1, 2020)', 'HXJN86431WFW', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'A1912';
    END IF;

    -- Insert Asset: BC826
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BC826', 'Camgear Tripod', 'Camgear Tripod', 'R1807V080166', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BC826';
    END IF;

    -- Insert Asset: BG889
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BG889', 'Godox - ML60iiBi', 'Godox - ML60iiBi', '25B00039674', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BG889';
    END IF;

    -- Insert Asset: BG511
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BG511', 'Godox - ML60iiBi', 'Godox - ML60iiBi', '25B00039671', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BG511';
    END IF;

    -- Insert Asset: BV696
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BV696', 'Verbatim Prtable Touch Screen 17.3 Monitor', 'Verbatim Prtable Touch Screen 17.3 Monitor', '495933174910090', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BV696';
    END IF;

    -- Insert Asset: BG674
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BG674', 'Godox - FL1502ii', 'Godox - FL1502ii', 'D00153250', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BG674';
    END IF;

    -- Insert Asset: BR377
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Broadcasting';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BR377', 'Rode - Caster', 'Rode - Caster', 'FE0123512', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BR377';
    END IF;

    -- Insert Asset: FL122
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Fridge';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('FL122', 'LG - GC - J247SLLZ Fridge', 'LG - GC - J247SLLZ Fridge', '009TRFK3A715', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'FL122';
    END IF;

    -- Insert Asset: GP815
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Gaming';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GP815', 'Playstation 5 Slim Disk', 'Playstation 5 Slim Disk', 'G115014F219526908', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GP815';
    END IF;

    -- Insert Asset: GW401
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Gaming';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GW401', 'Walking Pad Walking WPA1F Pro', 'Walking Pad Walking WPA1F Pro', 'APBKEUE/2408011729', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GW401';
    END IF;

    -- Insert Asset: GA368
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Gaming';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GA368', 'Acer Predator N20C11', 'Acer Predator N20C11', 'NHQB6EA0042070A2DF3400', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GA368';
    END IF;

    -- Insert Asset: GM288
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Gaming';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GM288', 'Meta VR S3A Goggles', 'Meta VR S3A Goggles', '2G0YC5ZF9Z02NP', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GM288';
    END IF;

    -- Insert Asset: GM933
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Gaming';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GM933', 'Meta VR S3A Goggles', 'Meta VR S3A Goggles', '2G0YC5ZG6M08ZN', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GM933';
    END IF;

    -- Insert Asset: GG287
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Google';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GG287', 'Google Home H0B', 'Google Home H0B', '8327M85VSA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GG287';
    END IF;

    -- Insert Asset: GG632
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Google';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GG632', 'Google Nest H2A', 'Google Nest H2A', '07200YCAB0AAAW', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GG632';
    END IF;

    -- Insert Asset: GG556
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Google';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('GG556', 'Google Nest H2A', 'Google Nest H2A', '07200YCAB0AC3S', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'GG556';
    END IF;

    -- Insert Asset: IS599
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ice Machine';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('IS599', 'Solenco - Ice Machine ZB-001', 'Solenco - Ice Machine ZB-001', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'IS599';
    END IF;

    -- Insert Asset: IS533
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ice Machine';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('IS533', 'Shomaster - SM-26', 'Shomaster - SM-26', 'SM2624060251', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'IS533';
    END IF;

    -- Insert Asset: IS634
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ice Machine';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('IS634', 'Shomaster - SM-26', 'Shomaster - SM-26', 'SM264060248', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'IS634';
    END IF;

    -- Insert Asset: MH816
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Masage Chair';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('MH816', 'HOM Tech Masage Chair', 'HOM Tech Masage Chair', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'MH816';
    END IF;

    -- Insert Asset: MM681
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Meraki';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('MM681', 'Meraki Coffee Machine', 'Meraki Coffee Machine', '203-250926-1009-0017', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'MM681';
    END IF;

    -- Insert Asset: PF750
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF750', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2022-50228', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF750';
    END IF;

    -- Insert Asset: PF311
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF311', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2025-158777', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF311';
    END IF;

    -- Insert Asset: PF162
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF162', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2024-151295', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF162';
    END IF;

    -- Insert Asset: PF149
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF149', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2022-50235', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF149';
    END IF;

    -- Insert Asset: PF952
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF952', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2023-67741', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF952';
    END IF;

    -- Insert Asset: PF645
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF645', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2025-158993', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF645';
    END IF;

    -- Insert Asset: PF838
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PF838', 'Freedom Won Lite 15/12 Battery LifePo4', 'Freedom Won Lite 15/12 Battery LifePo4', 'FW2022-50260', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PF838';
    END IF;

    -- Insert Asset: PS974
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PS974', 'Sun Synk 12k SG04LP3 Inverters', 'Sun Synk 12k SG04LP3 Inverters', '2404076399', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PS974';
    END IF;

    -- Insert Asset: PS382
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PS382', 'Sun Synk 12k SG04LP3 Inverters', 'Sun Synk 12k SG04LP3 Inverters', '2305302272', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PS382';
    END IF;

    -- Insert Asset: PS124
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Power';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PS124', 'Sun Synk 12k SG04LP3 Inverters', 'Sun Synk 12k SG04LP3 Inverters', '2404096622', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PS124';
    END IF;

    -- Insert Asset: PO805
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Projector';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PO805', 'Optoma UHZ66 DLP Projector', 'Optoma UHZ66 DLP Projector', 'Q7LD338K01AEC0007', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PO805';
    END IF;

    -- Insert Asset: SS161
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS161', 'Shure - SK100 G4 Transmitter', 'Shure - SK100 G4 Transmitter', '4040003238', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS161';
    END IF;

    -- Insert Asset: SS105
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS105', 'Shure - SK100 G4 Receiver', 'Shure - SK100 G4 Receiver', '4040002500', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS105';
    END IF;

    -- Insert Asset: SS294
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS294', 'Shure - SM7B', 'Shure - SM7B', '2AC19867674', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS294';
    END IF;

    -- Insert Asset: SS435
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS435', 'Shure - SM7B', 'Shure - SM7B', '3AC15448472', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS435';
    END IF;

    -- Insert Asset: SS257
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Shure';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS257', 'Shure - SM7B', 'Shure - SM7B', 'NA', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS257';
    END IF;

    -- Insert Asset: SS870
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS870', 'Sonos - Move 2', 'Sonos - Move 2', 'C4-38-75-05-55-8A:5', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS870';
    END IF;

    -- Insert Asset: SS757
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS757', 'Sonos - Era 300', 'Sonos - Era 300', '80-4A-F2-81-D2-F4:9', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS757';
    END IF;

    -- Insert Asset: SS152
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS152', 'Sonos - Era 300', 'Sonos - Era 300', '80-4A-F2-81-D2-60:E', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS152';
    END IF;

    -- Insert Asset: SS990
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS990', 'Sonos - Arc', 'Sonos - Arc', '38-42-0B-D0-F2-EB:G', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS990';
    END IF;

    -- Insert Asset: SS884
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS884', 'Sonos - Era 300', 'Sonos - Era 300', '80-4A-F2-81-D1-BA:1', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS884';
    END IF;

    -- Insert Asset: SS316
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS316', 'Sonos - Five', 'Sonos - Five', '34-7E-5C-DE-43-2C:0', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS316';
    END IF;

    -- Insert Asset: SS325
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS325', 'Sonos - Five', 'Sonos - Five', '34-7E-5C-DE-43-02:9', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS325';
    END IF;

    -- Insert Asset: SS189
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Sonos';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SS189', 'Sonos - Sub', 'Sonos - Sub', 'C43875A27194D', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SS189';
    END IF;

    -- Insert Asset: SL413
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Stove';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SL413', 'Lofra - Gass and Electrical Stove', 'Lofra - Gass and Electrical Stove', '24430276', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SL413';
    END IF;

    -- Insert Asset: SL347
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Stove';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SL347', 'Lofra - Gass and Electrical Stove', 'Lofra - Gass and Electrical Stove', '23280298', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SL347';
    END IF;

    -- Insert Asset: TS460
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS460', 'Samsung - UA65U8000FK', 'Samsung - UA65U8000FK', '02483FAY800248W', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS460';
    END IF;

    -- Insert Asset: TS923
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS923', 'Samsung - QA85Q7FAAK', 'Samsung - QA85Q7FAAK', '5U3FBY700016R', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS923';
    END IF;

    -- Insert Asset: TS282
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS282', 'Samsung - QA43QN90FAK', 'Samsung - QA43QN90FAK', '021Y3FAYA00014T', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS282';
    END IF;

    -- Insert Asset: TS174
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS174', 'Samsung 85 Inch', 'Samsung 85 Inch', '01X63FAX700134', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS174';
    END IF;

    -- Insert Asset: TS714
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS714', 'Samsung QA43QN90FAK', 'Samsung QA43QN90FAK', '021Y3FAYA00014T', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS714';
    END IF;

    -- Insert Asset: TS255
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS255', 'Samsung - QA85Q7FAAK', 'Samsung - QA85Q7FAAK', '025U3FBY800107A', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS255';
    END IF;

    -- Insert Asset: TS590
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS590', 'Samsung - UA75NU7100KBXA', 'Samsung - UA75NU7100KBXA', '00WR3FBKA00294A', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS590';
    END IF;

    -- Insert Asset: TS688
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TS688', 'Samsung - UA75NU7100K', 'Samsung - UA75NU7100K', '00ST3FAK700071A', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TS688';
    END IF;

    -- Insert Asset: TL949
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Tv''s';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('TL949', 'LG - 55UN7100PVA', 'LG - 55UN7100PVA', '009SAPC09832', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'TL949';
    END IF;

    -- Insert Asset: VD201
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'Lanseria';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Vacuum';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('VD201', 'Dyson Battery 6 Vacuum', 'Dyson Battery 6 Vacuum', '6DD-EU-TDE3855A', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'VD201';
    END IF;

    -- Insert Asset: KF983
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '1B04068Z0042JBBV7PS70160';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Kitchen';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('KF983', 'Fridge', 'Fridge', 'Hisense 223L Fridge Freezer Metallic', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'KF983';
    END IF;

    -- Insert Asset: KC993
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '27086';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Kitchen';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('KC993', 'Coffee Station', 'Coffee Station', 'Delongi Prima Donna Class', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'KC993';
    END IF;

    -- Insert Asset: PP294
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'E82268H4N295860';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Printing Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PP294', 'Printing', 'Printing', 'Brother MFC-L5710DW Printer', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PP294';
    END IF;

    -- Insert Asset: LA748
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '24042185012781900000';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Lounge';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('LA748', 'Aircon', 'Aircon', 'Alliance 18000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'LA748';
    END IF;

    -- Insert Asset: MA269
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'B3796B141902N00639';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Media Boardroom';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('MA269', 'Aircon', 'Aircon', 'JetAir 18000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'MA269';
    END IF;

    -- Insert Asset: PA138
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'E0050A610806W00021';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ps David Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA138', 'Aircon', 'Aircon', 'JetAir 12000BTU Cassette Unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA138';
    END IF;

    -- Insert Asset: PA295
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'E0311A610808W00099';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ps Maartin Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA295', 'Aircon', 'Aircon', 'JetAir 12000BTU Cassette Unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA295';
    END IF;

    -- Insert Asset: PA681
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'E0407A551714W00025';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Prophet Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA681', 'Aircon', 'Aircon', 'JetAir 24000BTU Cassette Unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA681';
    END IF;

    -- Insert Asset: PA976
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'E0407A551714W00005';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Prophet Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA976', 'Aircon', 'Aircon', 'JetAir 24000BTU Cassette Unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA976';
    END IF;

    -- Insert Asset: PA103
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'A2133A788211W00363';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ps Mari Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA103', 'Aircon', 'Aircon', 'JetAir 18000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA103';
    END IF;

    -- Insert Asset: MA968
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'B4015C334008N00958';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Media Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('MA968', 'Aircon', 'Aircon', 'JetAir 12000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'MA968';
    END IF;

    -- Insert Asset: MA469
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'B3792C334005N00082';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Media Boardroom';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('MA469', 'Aircon', 'Aircon', 'JetAir 32000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'MA469';
    END IF;

    -- Insert Asset: BA360
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'B3792C334005N00131';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Boardroom';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA360', 'Aircon', 'Aircon', 'JetAir 32000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA360';
    END IF;

    -- Insert Asset: SA311
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'A2133A787102W00295';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Store Room';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SA311', 'Aircon', 'Aircon', 'JetAir 18000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SA311';
    END IF;

    -- Insert Asset: BA885
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'A8061C271610W00516';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Barend Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('BA885', 'Aircon', 'Aircon', 'JetAir 9000BTU Split unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'BA885';
    END IF;

    -- Insert Asset: PA228
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'A8061C271610W00564';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Ps Gerhard Office';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('PA228', 'Aircon', 'Aircon', 'JetAir 9000BTU Split unit', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'PA228';
    END IF;

    -- Insert Asset: SA355
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'BDB6P9CR700165Z';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Store Room';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SA355', 'Aircon', 'Aircon', 'Samsung 24000BTU Underceiling', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SA355';
    END IF;

    -- Insert Asset: SG734
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '6104938';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Store Room';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SG734', 'Guitars', 'Guitars', 'Electric Guitar PRS', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SG734';
    END IF;

    -- Insert Asset: SG336
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE 'QMM1491';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Store Room';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SG336', 'Guitars', 'Guitars', 'Base Guitar (Yamaha) Model TRB JP2', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SG336';
    END IF;

    -- Insert Asset: SG277
    SELECT id INTO dept_id FROM public.departments WHERE name ILIKE '20060921060';
    SELECT id INTO type_id FROM public.item_types WHERE name ILIKE 'Store Room';
    
    IF dept_id IS NOT NULL AND type_id IS NOT NULL THEN
        INSERT INTO public.assets (code, name, description, serial_number, department_id, item_type_id, status, current_location_id)
        VALUES ('SG277', 'Guitars', 'Guitars', 'Taylor 414ce Acousitic Guitar', dept_id, type_id, 'available', dept_id)
        ON CONFLICT (code) DO NOTHING;
    ELSE
        RAISE WARNING 'Skipped asset % due to missing department or item type', 'SG277';
    END IF;

END $$;
