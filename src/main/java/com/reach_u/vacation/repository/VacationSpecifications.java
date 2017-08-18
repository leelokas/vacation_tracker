package com.reach_u.vacation.repository;

import com.reach_u.vacation.domain.Vacation;
import com.reach_u.vacation.domain.enumeration.PaymentType;
import com.reach_u.vacation.domain.enumeration.Stage;
import com.reach_u.vacation.domain.enumeration.VacationType;
import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Created by leelo on 5.11.16.
 */
public class VacationSpecifications {

    public static Specification<Vacation> byQuery(VacationType type, PaymentType paymentType, Stage stage,
                                                  Date startDate, Date endDate, String owner, String manager) {
        return new Specification<Vacation>() {
            @Override
            public Predicate toPredicate(Root<Vacation> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                List<Predicate> andExpressions = new ArrayList<>();
                List<Predicate> orExpressions = new ArrayList<>();
                if (type != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("type"), type));
                }
                if (paymentType != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("payment"), paymentType));
                }
                if (stage != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("stage"), stage));
                }
                if (startDate != null) {
                    andExpressions.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startDate"), startDate));
                }
                if (endDate != null) {
                    andExpressions.add(criteriaBuilder.lessThanOrEqualTo(root.get("endDate"), endDate));
                }
                if (owner != null) {
                    String ownerLower = owner.toLowerCase();

                    if (ownerLower.split("\\s+").length > 1) {
                        andExpressions.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("owner").get("firstName")), ownerLower.split("\\s+")[0]));
                        andExpressions.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("owner").get("lastName")), ownerLower.split("\\s+")[1]));
                    } else {
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("login")), ownerLower, 0), 0)
                        );
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("firstName")), ownerLower, 0), 0)
                        );
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("lastName")), ownerLower, 0), 0)
                        );
                    }
                }
                if (manager != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("owner").get("manager").get("login"), manager));
                }

                if (orExpressions.size() > 0) {
                    andExpressions.add(criteriaBuilder.or(orExpressions.toArray(new Predicate[0])));
                }

                return criteriaBuilder.and(andExpressions.toArray(new Predicate[0]));
            }
        };
    }
    public static Specification<Vacation> byQuery(VacationType type, PaymentType paymentType, List<Stage> stages,
                                                  Date startDate, Date endDate, String owner, String manager) {
        return new Specification<Vacation>() {
            @Override
            public Predicate toPredicate(Root<Vacation> root, CriteriaQuery<?> criteriaQuery, CriteriaBuilder criteriaBuilder) {
                List<Predicate> andExpressions = new ArrayList<>();
                List<Predicate> orExpressions = new ArrayList<>();
                if (type != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("type"), type));
                }
                if (paymentType != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("payment"), paymentType));
                }
                if (stages != null) {
                    andExpressions.add(root.get("stage").in(stages));
                }
                if (startDate != null) {
                    andExpressions.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startDate"), startDate));
                }
                if (endDate != null) {
                    andExpressions.add(criteriaBuilder.lessThanOrEqualTo(root.get("endDate"), endDate));
                }
                if (owner != null) {
                    String ownerLower = owner.toLowerCase();

                    if (ownerLower.split("\\s+").length > 1) {
                        andExpressions.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("owner").get("firstName")), ownerLower.split("\\s+")[0]));
                        andExpressions.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("owner").get("lastName")), ownerLower.split("\\s+")[1]));
                    } else {
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("login")), ownerLower, 0), 0)
                        );
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("firstName")), ownerLower, 0), 0)
                        );
                        orExpressions.add(criteriaBuilder.notEqual(
                                criteriaBuilder.locate(criteriaBuilder.lower(root.get("owner").get("lastName")), ownerLower, 0), 0)
                        );
                    }
                }
                if (manager != null) {
                    andExpressions.add(criteriaBuilder.equal(root.get("owner").get("manager").get("login"), manager));
                }

                if (orExpressions.size() > 0) {
                    andExpressions.add(criteriaBuilder.or(orExpressions.toArray(new Predicate[0])));
                }

                return criteriaBuilder.and(andExpressions.toArray(new Predicate[0]));
            }
        };
    }
}
