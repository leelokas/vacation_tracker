package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.PaymentType;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.domain.enumeration.VacationType;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by leelo on 5.11.16.
 */
public class VacationSpecifications {

    public static Specification<Vacation> byQuery(VacationType type, PaymentType paymentType, Stage stage) {
        return new Specification<Vacation>() {
            @Override
            public Predicate toPredicate(Root<Vacation> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                List<Predicate> expressions = new ArrayList<>();
                if (type != null) {
                    expressions.add(criteriaBuilder.equal(root.get("type"), type));
                }
                if (paymentType != null) {
                    expressions.add(criteriaBuilder.equal(root.get("payment"), paymentType));
                }
                if (stage != null) {
                    expressions.add(criteriaBuilder.equal(root.get("stage"), stage));
                }

                return criteriaBuilder.and(expressions.toArray(new Predicate[0]));
            }
        };
    }
}
